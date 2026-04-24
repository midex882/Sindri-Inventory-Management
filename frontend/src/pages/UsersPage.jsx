import { useState } from 'react'
import { Shield, User, Users, Crown, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getUsers().then(r => r.data),
  })
}

function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }) => authApi.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

function useUpdateFamilia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, familia }) => authApi.updateFamilia(userId, familia),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Crown, color: 'var(--color-warning)', bg: 'var(--color-warning-highlight)' },
  viewer: { label: 'Viewer', icon: User, color: 'var(--color-text-muted)', bg: 'var(--color-surface-offset)' },
}

export default function UsersPage() {
  const { isAdmin, profile } = useAuth()
  const { data: users = [], isLoading } = useUsers()
  const updateRole = useUpdateRole()
  const updateFamilia = useUpdateFamilia()

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <Shield size={32} className="text-[var(--color-text-faint)]" />
        <p style={{ color: 'var(--color-text-muted)' }}>No tienes acceso a esta sección</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
          Usuarios
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {isLoading ? '—' : `${users.length} usuario${users.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-[var(--color-text-faint)]" />
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {users.map((u, i) => {
            const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.viewer
            const Icon = cfg.icon
            const isSelf = u.id === profile?.id

            return (
              <div
                key={u.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                  borderBottom: i < users.length - 1 ? '1px solid var(--color-divider)' : 'none'
                }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold"
                  style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)' }}
                >
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    : u.email?.[0]?.toUpperCase()
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {u.full_name || u.email}
                    </p>
                    {isSelf && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)' }}>
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {u.email}
                  </p>
                </div>

                {/* Rol actual */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <Icon size={11} />
                  {cfg.label}
                </div>
                {!isSelf && u.role === 'viewer' && (
                  <button
                    onClick={() => updateFamilia.mutate({ userId: u.id, familia: !u.familia })}
                    disabled={updateFamilia.isPending}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    style={{
                      border: '1px solid var(--color-border)',
                      background: u.familia ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
                      color: u.familia ? 'var(--color-primary)' : 'var(--color-text-muted)'
                    }}
                  >
                    {u.familia ? 'Quitar de familia' : 'Añadir a familia'}
                  </button>
                )}
                {/* Cambiar rol — solo si no es uno mismo */}
                {!isSelf && (
                  <button
                    onClick={() => updateRole.mutate({
                      userId: u.id,
                      role: u.role === 'admin' ? 'viewer' : 'admin'
                    })}
                    disabled={updateRole.isPending}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    style={{
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}