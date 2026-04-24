import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Package, MapPin, Tag, Layers, FileText, Loader2 } from 'lucide-react'
import { useItem, useDeleteItem } from '../hooks/useItems'
import { useAuth } from '../context/AuthContext'
import MovementsPanel from '../components/MovementsPanel'
import ItemForm from '../components/ItemForm'
import MoveItemModal from '../components/MoveItemModal'
import ChangeQuantityModal from '../components/ChangeQuantityModal'


function DetailRow({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-faint)' }}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <p className="text-sm" style={{ color: 'var(--color-text)' }}>{value}</p>
      </div>
    </div>
  )
}

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isEditor } = useAuth()
  const { data: item, isLoading } = useItem(id)
  const deleteItem = useDeleteItem()
  const [showEdit, setShowEdit] = useState(false)
  const [showMove, setShowMove] = useState(false)
  const [showQty, setShowQty]   = useState(false)
  const [showImage, setShowImage] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) return
    await deleteItem.mutateAsync(id)
    navigate('/items', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-[var(--color-text-faint)]" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <Package size={32} className="text-[var(--color-text-faint)]" />
        <p style={{ color: 'var(--color-text-muted)' }}>Artículo no encontrado</p>
        <button
          onClick={() => navigate('/items')}
          className="text-sm"
          style={{ color: 'var(--color-primary)' }}
        >
          Volver al inventario
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/items')}
          className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-text)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={14} />
          Volver
        </button>
      <div className="flex items-center gap-2">
        {/* Todos los usuarios */}
        <button
          onClick={() => setShowMove(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
        >
          <MapPin size={13} />
          Mover
        </button>
        <button
          onClick={() => setShowQty(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
        >
          <Layers size={13} />
          Cantidad
        </button>

        {/* Solo admin */}
        {isAdmin && (
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
          >
            <Pencil size={13} />
            Editar
          </button>
        )}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ border: '1px solid var(--color-error)', background: 'var(--color-surface)', color: 'var(--color-error)' }}
          >
            <Trash2 size={13} />
            Eliminar
          </button>
        )}
      </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Columna izquierda — imagen + datos */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Card principal */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            {item.imagen_url && (
              <img
                src={item.imagen_url}
                alt={item.nombre}
                width={800}
                height={300}
                loading="lazy"
                onClick={() => setShowImage(true)}
                className="w-full object-cover cursor-pointer"
                style={{ maxHeight: 280 }}
              />
            )}
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {item.nombre}
                </h1>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{
                    background: 'var(--color-primary-highlight)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {item.categoria}
                </span>
              </div>
              {item.descripcion && (
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  {item.descripcion}
                </p>
              )}

              <div className="mt-4">
                <DetailRow icon={Package} label="Cantidad" value={`${item.cantidad} uds.`} />
                <DetailRow icon={MapPin} label="Localización" value={item.localizacion} />
                <DetailRow icon={Tag} label="Material" value={item.material} />
                <DetailRow icon={Layers} label="Categoría" value={item.categoria} />
                <DetailRow icon={FileText} label="Notas" value={item.notas} />
              </div>

              <p className="text-xs mt-4" style={{ color: 'var(--color-text-faint)' }}>
                Creado el {new Date(item.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha — movimientos */}
        <div
          className="rounded-xl flex flex-col"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div
            className="px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Historial de movimientos
            </h2>
          </div>
          <div className="px-5 py-4 overflow-y-auto flex-1">
            <MovementsPanel itemId={id} />
          </div>
        </div>

      </div>
      {showMove && <MoveItemModal item={item} onClose={() => setShowMove(false)} />}
      {showQty  && <ChangeQuantityModal item={item} onClose={() => setShowQty(false)} />}
      {showImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'oklch(0 0 0 / 0.85)' }}
          onClick={() => setShowImage(false)}
        >
          <img
            src={item.imagen_url}
            alt={item.nombre}
            className="rounded-xl object-contain"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {showEdit && (
        <ItemForm item={item} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}