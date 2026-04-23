import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { useUpdateItem } from '../hooks/useItems'

export default function ChangeQuantityModal({ item, onClose }) {
  const [delta, setDelta] = useState(1)
  const [mode, setMode] = useState('add') // 'add' | 'subtract'
  const updateItem = useUpdateItem()

  async function handleSubmit(e) {
    e.preventDefault()
    const nuevaCantidad = mode === 'add'
      ? item.cantidad + delta
      : Math.max(0, item.cantidad - delta)
    await updateItem.mutateAsync({ id: item.id, cantidad: nuevaCantidad })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl w-full max-w-sm p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Cambiar cantidad
          </h2>
          <button onClick={onClose}>
            <X size={15} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Cantidad actual: <strong>{item.cantidad} uds.</strong>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {['add', 'subtract'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: mode === m ? 'var(--color-primary)' : 'var(--color-surface-offset)',
                  color: mode === m ? '#fff' : 'var(--color-text-muted)',
                  border: '1px solid',
                  borderColor: mode === m ? 'var(--color-primary)' : 'var(--color-border)'
                }}
              >
                {m === 'add' ? <Plus size={13} /> : <Minus size={13} />}
                {m === 'add' ? 'Añadir' : 'Restar'}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              value={delta}
              onChange={e => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
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
          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
            Resultado: {mode === 'add' ? item.cantidad + delta : Math.max(0, item.cantidad - delta)} uds.
          </p>
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