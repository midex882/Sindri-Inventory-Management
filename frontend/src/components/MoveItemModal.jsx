import { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { useUpdateItem } from '../hooks/useItems'

export default function MoveItemModal({ item, onClose }) {
  const [localizacion, setLocalizacion] = useState(item.localizacion ?? '')
  const updateItem = useUpdateItem()

  async function handleSubmit(e) {
    e.preventDefault()
    await updateItem.mutateAsync({ id: item.id, localizacion })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl w-full max-w-sm p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Mover artículo
            </h2>
          </div>
          <button onClick={onClose}>
            <X size={15} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Localización actual: <strong>{item.localizacion}</strong>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Nueva localización
            </label>
            <input
              value={localizacion}
              onChange={e => setLocalizacion(e.target.value)}
              required
              style={{
                padding: '0.5rem 0.75rem',
                background: 'var(--color-surface-offset)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={updateItem.isPending}
            className="py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            {updateItem.isPending ? 'Guardando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  )
}