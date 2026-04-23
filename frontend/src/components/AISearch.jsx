import { useState, useRef } from 'react'
import { Camera, Upload, Sparkles, X, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { aiApi } from '../services/api'

export default function AISearch({ onClose }) {
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const navigate = useNavigate()

  async function handleFile(file) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const { data } = await aiApi.identify(file)
      setResult(data)
    } catch {
      setError('No se pudo analizar la imagen. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)' }}
    >
      <div
        className="w-full max-w-md rounded-xl flex flex-col overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          maxHeight: '90dvh'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-primary)]" />
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Buscar por imagen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-offset)] transition-colors"
          >
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {/* Upload zone */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl py-6 transition-colors"
              style={{
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <Upload size={20} />
              <span className="text-xs">Subir imagen</span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl py-6 transition-colors"
              style={{
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <Camera size={20} />
              <span className="text-xs">Usar cámara</span>
            </button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*"
            className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={e => handleFile(e.target.files?.[0])} />

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="preview"
              width={400}
              height={200}
              loading="lazy"
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: 200 }}
            />
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Analizando imagen...
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--color-error)' }}>
              {error}
            </p>
          )}

          {/* Result */}
          {result && (
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg"
                style={{ background: 'var(--color-primary-highlight)' }}
              >
                <Sparkles size={14} className="text-[var(--color-primary)]" />
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  Objeto detectado:{' '}
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {result.objeto_detectado}
                  </span>
                </p>
              </div>

              {result.coincidencias.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                  No se encontraron artículos coincidentes en el inventario
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {result.coincidencias.length} artículo{result.coincidencias.length !== 1 ? 's' : ''} encontrado{result.coincidencias.length !== 1 ? 's' : ''}
                  </p>
                  {result.coincidencias.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { navigate(`/items/${item.id}`); onClose() }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                      style={{
                        background: 'var(--color-surface-offset)',
                        border: '1px solid var(--color-border)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    >
                      {item.imagen_url && (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          width={36}
                          height={36}
                          loading="lazy"
                          className="rounded-md object-cover shrink-0"
                          style={{ width: 36, height: 36 }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                          {item.nombre}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {item.localizacion} · {item.cantidad} uds.
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-[var(--color-text-faint)] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}