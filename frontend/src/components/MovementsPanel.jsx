import { ArrowRight, Package, MapPin, Loader2 } from 'lucide-react'
import { useMovements } from '../hooks/useMovements'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function MovementsPanel({ itemId }) {
  const { data: movements = [], isLoading } = useMovements(itemId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={16} className="animate-spin text-[var(--color-text-faint)]" />
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 gap-2">
        <Package size={24} className="text-[var(--color-text-faint)]" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Sin movimientos registrados
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {movements.map(m => (
        <div
          key={m.id}
          className="flex items-start gap-3 px-4 py-3 rounded-lg"
          style={{ background: 'var(--color-surface-offset)' }}
        >
          <div
            className="mt-0.5 p-1.5 rounded-md shrink-0"
            style={{
              background: m.tipo === 'cantidad'
                ? 'color-mix(in oklch, var(--color-primary) 15%, transparent)'
                : 'color-mix(in oklch, var(--color-warning) 15%, transparent)',
              color: m.tipo === 'cantidad'
                ? 'var(--color-primary)'
                : 'var(--color-warning)'
            }}
          >
            {m.tipo === 'cantidad'
              ? <Package size={12} />
              : <MapPin size={12} />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-medium capitalize"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {m.tipo}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <span style={{ color: 'var(--color-text)' }}>{m.valor_anterior}</span>
                <ArrowRight size={12} className="text-[var(--color-text-faint)]" />
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                  {m.valor_nuevo}
                </span>
              </div>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
              {formatDate(m.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}