import { useState, useMemo } from 'react'
import { Plus, Search, Sparkles, X, SlidersHorizontal } from 'lucide-react'
import { useItems } from '../hooks/useItems'
import { useAuth } from '../context/AuthContext'
import ItemsTable from '../components/ItemsTable'
import ItemForm from '../components/ItemForm'
import AISearch from '../components/AISearch'

const FILTER_FIELDS = [
  { key: 'categoria', label: 'Categoría' },
  { key: 'material', label: 'Material' },
  { key: 'localizacion', label: 'Localización' },
]

export default function ItemsPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { isEditor } = useAuth()

  const { data: items = [], isLoading } = useItems()

  const filteredItems = useMemo(() => {
    let result = items
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      result = result.filter(item =>
        ['nombre', 'descripcion', 'categoria', 'material', 'localizacion']
          .some(field => item[field]?.toLowerCase().includes(q))
      )
    }
    Object.entries(activeFilters).forEach(([field, value]) => {
      if (value) result = result.filter(item => item[field] === value)
    })
    return result
  }, [items, globalFilter, activeFilters])

  const filterOptions = useMemo(() => {
    const opts = {}
    FILTER_FIELDS.forEach(({ key }) => {
      opts[key] = [...new Set(items.map(i => i[key]).filter(Boolean))].sort()
    })
    return opts
  }, [items])

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  function setFilter(field, value) {
    setActiveFilters(prev => ({ ...prev, [field]: value === prev[field] ? '' : value }))
  }

  function clearFilters() {
    setActiveFilters({})
    setGlobalFilter('')
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Inventario
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {isLoading ? '—' : `${filteredItems.length} artículo${filteredItems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface)'
            }}
          >
            <Sparkles size={14} className="text-[var(--color-primary)]" />
            Buscar por imagen
          </button>
          {isEditor && (
            <button
              onClick={() => { setEditItem(null); setShowForm(true) }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              <Plus size={14} />
              Nuevo artículo
            </button>
          )}
        </div>
      </div>

      {/* Search y filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
            />
            <input
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Buscar por nombre, categoría, material, localización..."
              style={{
                width: '100%',
                paddingLeft: '2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors relative"
            style={{
              border: `1px solid ${activeFilterCount > 0 ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: 'var(--color-surface)',
              color: activeFilterCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeFilterCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          {(activeFilterCount > 0 || globalFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface)'
              }}
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros dinámicos */}
        {showFilters && (
          <div
            className="rounded-xl p-4 flex flex-col gap-4"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            {FILTER_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions[key].length === 0 ? (
                    <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                      Sin opciones disponibles
                    </span>
                  ) : (
                    filterOptions[key].map(value => (
                      <button
                        key={value}
                        onClick={() => setFilter(key, value)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: activeFilters[key] === value
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-offset)',
                          color: activeFilters[key] === value
                            ? '#fff'
                            : 'var(--color-text-muted)',
                          border: '1px solid',
                          borderColor: activeFilters[key] === value
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'
                        }}
                      >
                        {value}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-offset) 50%, var(--color-surface) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      ) : (
        <ItemsTable
          data={filteredItems}
          onEdit={(item) => { setEditItem(item); setShowForm(true) }}
        />
      )}

      {/* Modales */}
      {showForm && (
        <ItemForm
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null) }}
        />
      )}
      {showAI && <AISearch onClose={() => setShowAI(false)} />}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}