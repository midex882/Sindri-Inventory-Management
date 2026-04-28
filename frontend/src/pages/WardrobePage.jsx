import { useState, useRef } from 'react'
import { Plus, Search, X, ChevronLeft, ChevronRight, Pencil, Trash2, Shirt } from 'lucide-react'
import { useWardrobe, useCreatePrenda, useUpdatePrenda, useDeletePrenda } from '../hooks/useWardrobe'
import { useNavigate } from 'react-router-dom'

const CATEGORIAS = ['camiseta', 'camisa', 'sudadera', 'pantalón', 'chaqueta', 'abrigo', 'otro']
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40']

function CarouselModal({ fotos, inicial = 0, onClose }) {
  const [idx, setIdx] = useState(inicial)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.9)' }}
      onClick={e => { e.stopPropagation(); onClose() }}  // ← añade stopPropagation
    >
      <button
        onClick={e => { e.stopPropagation(); onClose() }}  // ← ídem
        className="absolute top-4 right-4 p-2 rounded-full"
        style={{ background: 'oklch(1 0 0 / 0.1)', color: 'white' }}
      >
        <X size={20} />
      </button>

      <div
        className="relative flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
      >
        <img
          src={fotos[idx]}
          alt={`Foto ${idx + 1}`}
          className="rounded-xl object-contain"
          style={{ maxWidth: '80vw', maxHeight: '82vh' }}
        />

        {fotos.length > 1 && (
          <>
            <button
              onClick={() => setIdx((idx - 1 + fotos.length) % fotos.length)}
              className="absolute left-0 -translate-x-14 p-2 rounded-full"
              style={{ background: 'oklch(1 0 0 / 0.15)', color: 'white' }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setIdx((idx + 1) % fotos.length)}
              className="absolute right-0 translate-x-14 p-2 rounded-full"
              style={{ background: 'oklch(1 0 0 / 0.15)', color: 'white' }}
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === idx ? 'white' : 'oklch(1 0 0 / 0.4)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PrendaCard({ prenda, onDelete }) {
  const navigate = useNavigate()
  const [carousel, setCarousel] = useState(null)

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onClick={() => navigate(`/wardrobe/${prenda.id}`)}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ background: 'var(--color-surface-offset)' }}
        onClick={e => {
          if (!prenda.fotos?.length) return
          e.stopPropagation()
          setCarousel(0)
        }}
      >
        {prenda.fotos?.[0] ? (
          <img
            src={prenda.fotos[0]}
            alt={prenda.nombre}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt size={40} style={{ color: 'var(--color-text-faint)' }} />
          </div>
        )}
        {prenda.fotos?.length > 1 && (
          <span
            className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: 'oklch(0 0 0 / 0.5)', color: 'white' }}
          >
            +{prenda.fotos.length - 1}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div>
          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
            {prenda.nombre}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            {[prenda.marca, prenda.talla].filter(Boolean).join(' · ')}
          </p>
        </div>

        {prenda.colores?.length > 0 && (
          <div className="flex gap-1.5">
            {prenda.colores.map(color => (
              <div
                key={color}
                title={color}
                className="w-4 h-4 rounded-full border"
                style={{ background: color, borderColor: 'var(--color-border)' }}
              />
            ))}
          </div>
        )}

        <button
          onClick={e => { e.stopPropagation(); onDelete(prenda) }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors mt-0.5"
          style={{
            border: '1px solid var(--color-error-highlight)',
            color: 'var(--color-error)',
            background: 'var(--color-surface-offset)'
          }}
        >
          <Trash2 size={12} /> Eliminar
        </button>
      </div>

      {carousel !== null && (
        <CarouselModal
          fotos={prenda.fotos}
          inicial={carousel}
          onClose={() => setCarousel(null)}
        />
      )}
    </div>
  )
}

function PrendaForm({ inicial, onSubmit, onCancel, loading }) {
  const [fields, setFields] = useState({
    nombre: inicial?.nombre ?? '',
    talla: inicial?.talla ?? '',
    categoria: inicial?.categoria ?? '',
    tipo: inicial?.tipo ?? '',
    marca: inicial?.marca ?? '',
    material: inicial?.material ?? '',
  })
  const [fotosNuevas, setFotosNuevas] = useState([])
  const [fotosExistentes, setFotosExistentes] = useState(inicial?.fotos ?? [])
  const [previews, setPreviews] = useState([])
  const fileRef = useRef()

  function handleFiles(files) {
    const arr = Array.from(files)
    setFotosNuevas(prev => [...prev, ...arr])
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))])
  }

  function removeExistente(url) {
    setFotosExistentes(prev => prev.filter(u => u !== url))
  }

  function removeNueva(i) {
    setFotosNuevas(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(fields).forEach(([k, v]) => v && fd.append(k, v))
    fotosNuevas.forEach(f => fd.append('fotos_nuevas', f))
    fd.append('fotos_existentes', JSON.stringify(fotosExistentes))
    if (!inicial) {
      fotosNuevas.forEach(f => fd.append('fotos', f))
    }
    onSubmit(fd, fields)
  }

  const input = "w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2"
  const inputStyle = {
    background: 'var(--color-surface-offset)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Nombre *</label>
          <input required className={input} style={inputStyle}
            value={fields.nombre} onChange={e => setFields(p => ({ ...p, nombre: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Categoría</label>
          <select className={input} style={inputStyle}
            value={fields.categoria} onChange={e => setFields(p => ({ ...p, categoria: e.target.value }))}>
            <option value="">—</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Talla</label>
          <select className={input} style={inputStyle}
            value={fields.talla} onChange={e => setFields(p => ({ ...p, talla: e.target.value }))}>
            <option value="">—</option>
            {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Tipo</label>
          <input className={input} style={inputStyle} placeholder="vaquero, chino..."
            value={fields.tipo} onChange={e => setFields(p => ({ ...p, tipo: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Marca</label>
          <input className={input} style={inputStyle}
            value={fields.marca} onChange={e => setFields(p => ({ ...p, marca: e.target.value }))} />
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Material</label>
          <input className={input} style={inputStyle} placeholder="algodón, poliéster..."
            value={fields.material} onChange={e => setFields(p => ({ ...p, material: e.target.value }))} />
        </div>
      </div>

      {/* Fotos */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Fotos</label>
        <div className="flex flex-wrap gap-2">
          {fotosExistentes.map(url => (
            <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}>
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeExistente(url)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'oklch(0 0 0 / 0.6)', color: 'white' }}>
                <X size={10} />
              </button>
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--color-primary)' }}>
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeNueva(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'oklch(0 0 0 / 0.6)', color: 'white' }}>
                <X size={10} />
              </button>
            </div>
          ))}
          <button type="button"
            onClick={() => fileRef.current.click()}
            className="w-16 h-16 rounded-lg flex items-center justify-center text-xs transition-colors"
            style={{
              border: '2px dashed var(--color-border)',
              color: 'var(--color-text-faint)'
            }}>
            <Plus size={18} />
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={e => handleFiles(e.target.files)} />
        </div>
        {fotosNuevas.length === 0 && fotosExistentes.length === 0 && (
          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
            La primera foto se usará para extraer los colores principales
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: 'white', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Guardando...' : inicial ? 'Guardar cambios' : 'Añadir prenda'}
        </button>
      </div>
    </form>
  )
}

export default function WardrobePage() {
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | { prenda }
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: prendas = [], isLoading } = useWardrobe(
    Object.fromEntries(Object.entries({ search, categoria: categoriaFiltro }).filter(([, v]) => v))
  )
  const crear = useCreatePrenda()
  const actualizar = useUpdatePrenda()
  const eliminar = useDeletePrenda()

  async function handleCreate(fd) {
    // Para create, las fotos van en 'fotos', no en 'fotos_nuevas'
    await crear.mutateAsync(fd)
    setModal(null)
  }

  async function handleUpdate(fd) {
    await actualizar.mutateAsync({ id: modal.prenda.id, formData: fd })
    setModal(null)
  }

  async function handleDelete() {
    await eliminar.mutateAsync(confirmDelete.id)
    setConfirmDelete(null)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg)' }}>
    {/* Header + Filtros agrupados */}
    <div className="px-6 pt-5 pb-0 shrink-0">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Título y botón */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Armario</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {prendas.length} prenda{prendas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            <Plus size={15} /> Añadir prenda
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-faint)' }} />
            <input
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm border outline-none"
              style={{
                background: 'var(--color-surface-offset)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              placeholder="Buscar por nombre, marca, color..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['', ...CATEGORIAS].map(cat => (
              <button key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors capitalize"
                style={{
                  background: categoriaFiltro === cat ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
                  color: categoriaFiltro === cat ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)'
                }}>
                {cat || 'Todo'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--color-border)' }}>
                <div className="skeleton aspect-[3/4]" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : prendas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-24"
            style={{ color: 'var(--color-text-muted)' }}>
            <Shirt size={40} style={{ color: 'var(--color-text-faint)' }} />
            <p className="text-sm">
              {search || categoriaFiltro ? 'No hay prendas que coincidan' : 'Añade tu primera prenda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {prendas.map(p => (
              <PrendaCard key={p.id} prenda={p}
                onDelete={setConfirmDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'oklch(0 0 0 / 0.5)' }}
          onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl flex flex-col"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                {modal === 'create' ? 'Añadir prenda' : 'Editar prenda'}
              </h2>
              <button onClick={() => setModal(null)}
                className="p-1 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <PrendaForm
                inicial={modal === 'create' ? null : modal.prenda}
                onSubmit={modal === 'create' ? handleCreate : handleUpdate}
                onCancel={() => setModal(null)}
                loading={crear.isPending || actualizar.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'oklch(0 0 0 / 0.5)' }}
          onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
              ¿Eliminar <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={eliminar.isPending}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--color-error)', color: 'white' }}>
                {eliminar.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}