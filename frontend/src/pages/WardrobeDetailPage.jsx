import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { wardrobeApi } from '../services/api'
import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Shirt, Tag, Ruler, Layers, Palette, Building2, X } from 'lucide-react'

function CarouselModal({ fotos, inicial = 0, onClose }) {
  const [idx, setIdx] = useState(inicial)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.9)' }}
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full"
        style={{ background: 'oklch(1 0 0 / 0.1)', color: 'white' }}>
        <X size={20} />
      </button>
      <div className="relative flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
        <img src={fotos[idx]} alt={`Foto ${idx + 1}`}
          className="rounded-xl object-contain"
          style={{ maxWidth: '80vw', maxHeight: '82vh' }} />
        {fotos.length > 1 && (
          <>
            <button onClick={() => setIdx((idx - 1 + fotos.length) % fotos.length)}
              className="absolute left-0 -translate-x-14 p-2 rounded-full"
              style={{ background: 'oklch(1 0 0 / 0.15)', color: 'white' }}>
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => setIdx((idx + 1) % fotos.length)}
              className="absolute right-0 translate-x-14 p-2 rounded-full"
              style={{ background: 'oklch(1 0 0 / 0.15)', color: 'white' }}>
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === idx ? 'white' : 'oklch(1 0 0 / 0.4)' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Galeria({ fotos }) {
  const [principal, setPrincipal] = useState(0)
  const [modal, setModal] = useState(null)

  if (!fotos?.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl aspect-square"
        style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)' }}>
        <Shirt size={64} style={{ color: 'var(--color-text-faint)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative rounded-2xl overflow-hidden cursor-zoom-in aspect-square"
        style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)' }}
        onClick={() => setModal(principal)}
      >
        <img src={fotos[principal]} alt="Foto principal"
          className="w-full h-full object-cover" />
        {fotos.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setPrincipal((principal - 1 + fotos.length) % fotos.length) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
              style={{ background: 'oklch(0 0 0 / 0.4)', color: 'white' }}>
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setPrincipal((principal + 1) % fotos.length) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
              style={{ background: 'oklch(0 0 0 / 0.4)', color: 'white' }}>
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((url, i) => (
            <button key={i} onClick={() => setPrincipal(i)}
              className="shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
              style={{
                border: i === principal
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
                opacity: i === principal ? 1 : 0.6
              }}>
              <img src={url} alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {modal !== null && (
        <CarouselModal fotos={fotos} inicial={modal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

function Campo({ icon: Icon, label, valor }) {
  if (!valor) return null
  return (
    <div className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-faint)' }}>
        <Icon size={15} />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{label}</p>
        <p className="text-sm font-medium capitalize" style={{ color: 'var(--color-text)' }}>{valor}</p>
      </div>
    </div>
  )
}

export default function WardrobeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: prenda, isLoading, isError } = useQuery({
    queryKey: ['wardrobe', id],
    queryFn: () => wardrobeApi.get(id).then(r => r.data),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center gap-3 px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="skeleton w-8 h-8 rounded-lg" />
          <div className="skeleton skeleton-text w-32" />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-text" style={{ width: `${60 + i * 8}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !prenda) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3"
        style={{ color: 'var(--color-text-muted)' }}>
        <Shirt size={40} style={{ color: 'var(--color-text-faint)' }} />
        <p className="text-sm">Prenda no encontrada</p>
        <button onClick={() => navigate('/wardrobe')}
          className="text-sm" style={{ color: 'var(--color-primary)' }}>
          Volver al armario
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <button onClick={() => navigate('/wardrobe')}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface-offset)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {prenda.nombre}
          </h1>
          {prenda.categoria && (
            <p className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>
              {prenda.categoria}
            </p>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">

          {/* Galería */}
          <Galeria fotos={prenda.fotos} />

          {/* Detalles */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                {prenda.nombre}
              </h2>
              {prenda.marca && (
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {prenda.marca}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <Campo icon={Tag} label="Categoría" valor={prenda.categoria} />
              <Campo icon={Layers} label="Tipo" valor={prenda.tipo} />
              <Campo icon={Ruler} label="Talla" valor={prenda.talla} />
              <Campo icon={Building2} label="Marca" valor={prenda.marca} />
              <Campo icon={Shirt} label="Material" valor={prenda.material} />
            </div>

            {prenda.colores?.length > 0 && (
              <div className="flex flex-col gap-2 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <Palette size={15} style={{ color: 'var(--color-text-faint)' }} />
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Colores detectados</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {prenda.colores.map(color => (
                    <div key={color} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full shadow-sm"
                        style={{ background: color, border: '1px solid var(--color-border)' }} />
                      <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs mt-4" style={{ color: 'var(--color-text-faint)' }}>
              Añadida el {new Date(prenda.created_at).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}