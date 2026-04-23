import { useState } from 'react'
import { X, Users } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function AddToFamilyModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ familia: true })
      .eq('email', email)
      .eq('role', 'viewer')
    setLoading(false)
    if (error) {
      setStatus({ ok: false, msg: 'No se encontró ese viewer o hubo un error.' })
    } else {
      setStatus({ ok: true, msg: `${email} añadido a la familia.` })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl w-full max-w-sm p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={15} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Añadir a la familia
            </h2>
          </div>
          <button onClick={onClose}><X size={15} style={{ color: 'var(--color-text-muted)' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email del viewer"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          {status && (
            <p className="text-xs" style={{ color: status.ok ? 'var(--color-success)' : 'var(--color-error)' }}>
              {status.msg}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  )
}