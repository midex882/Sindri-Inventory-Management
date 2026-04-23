import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useCreateItem, useUpdateItem, useUploadImage } from '../hooks/useItems'

const emptyForm = {
  nombre: '', descripcion: '', categoria: '',
  material: '', localizacion: '', cantidad: 0,
  imagen_url: '', notas: ''
}

const inputStyle = {
  width: '100%',
  background: 'var(--color-surface-offset)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '0.875rem',
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'border-color 150ms',
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export default function ItemForm({ item = null, onClose }) {
  const [form, setForm] = useState(item ? { ...emptyForm, ...item } : emptyForm)
  const [imagePreview, setImagePreview] = useState(item?.imagen_url ?? null)
  const [cameraActive, setCameraActive] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const uploadImage = useUploadImage()

  const isEditing = !!item
  const isLoading = createItem.isPending || updateItem.isPending || uploadImage.isPending

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleImageFile(file) {
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    const { url } = await uploadImage.mutateAsync(file)
    set('imagen_url', url)
  }

  async function handleCapture() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'captura.jpg', { type: 'image/jpeg' })
      await handleImageFile(file)
      stopCamera()
    }, 'image/jpeg', 0.85)
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      setCameraActive(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
    } catch {
      cameraInputRef.current?.click()
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, cantidad: Number(form.cantidad) }
    if (isEditing) {
      await updateItem.mutateAsync({ id: item.id, data: payload })
    } else {
      await createItem.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)' }}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          maxHeight: '90dvh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
            {isEditing ? 'Editar artículo' : 'Nuevo artículo'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-offset)] transition-colors"
          >
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Imagen */}
            <Field label="Imagen">
              {cameraActive ? (
                <div className="flex flex-col gap-2">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                    style={{ maxHeight: 200, objectFit: 'cover', background: '#000' }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--color-primary)',
                        color: '#fff'
                      }}
                    >
                      Capturar foto
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--color-surface-offset)]"
                      style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      width={64}
                      height={64}
                      className="rounded-lg object-cover shrink-0"
                      style={{ width: 64, height: 64 }}
                    />
                  )}
                  <div className="flex gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg text-sm transition-colors"
                      style={{
                        border: '1px dashed var(--color-border)',
                        color: 'var(--color-text-muted)',
                        padding: '10px',
                        minHeight: 64
                      }}
                    >
                      <Upload size={14} /> Subir archivo
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2 rounded-lg text-sm transition-colors px-3"
                      style={{
                        border: '1px dashed var(--color-border)',
                        color: 'var(--color-text-muted)',
                        minHeight: 64
                      }}
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleImageFile(e.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => handleImageFile(e.target.files?.[0])}
              />
            </Field>

            {/* Campos */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre *">
                <input
                  required
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </Field>
              <Field label="Categoría *">
                <input
                  required
                  value={form.categoria}
                  onChange={e => set('categoria', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </Field>
            </div>

            <Field label="Descripción">
              <textarea
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Material">
                <input
                  value={form.material}
                  onChange={e => set('material', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </Field>
              <Field label="Localización *">
                <input
                  required
                  value={form.localizacion}
                  onChange={e => set('localizacion', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Cantidad *">
                <input
                  required
                  type="number"
                  min={0}
                  value={form.cantidad}
                  onChange={e => set('cantidad', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </Field>
              <Field label="Notas">
                <input
                  value={form.notas}
                  onChange={e => set('notas', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </Field>
            </div>

          </div>

          {/* Footer */}
          <div
            className="flex gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}