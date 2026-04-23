import { NavLink, useNavigate } from 'react-router-dom'
import { Package, LogOut, Users, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/items', icon: Package, label: 'Inventario' },
]

export default function Sidebar() {
  const { profile, logout, isAdmin } = useAuth()
    console.log('Sidebar profile:', profile)
  const navigate = useNavigate()
  const [accountOpen, setAccountOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="flex flex-col w-56 min-h-screen shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 py-5"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-label="Sindri">
          <rect width="36" height="36" rx="8" fill="var(--color-primary)" opacity="0.15"/>
          <path d="M10 12h6l2 4-2 4h-6l2-4-2-4z" fill="var(--color-primary)"/>
          <path d="M18 12h8v2h-8v-2zM18 17h8v2h-8v-2zM18 22h5v2h-5v-2z" fill="var(--color-text-muted)"/>
        </svg>
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>
          Sindri
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'text-[var(--color-primary)] bg-[var(--color-primary-highlight)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-offset)]'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'text-[var(--color-primary)] bg-[var(--color-primary-highlight)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-offset)]'
              }`
            }
          >
            <Users size={16} />
            Usuarios
          </NavLink>
        )}
      </nav>

      {/* Account */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => setAccountOpen(!accountOpen)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-[var(--color-surface-offset)]"
        >
        <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden">
          {profile?.avatar_url
            ? <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            : <div
                className="w-full h-full flex items-center justify-center text-xs font-semibold"
                style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)' }}
              >
                {profile?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
          }
        </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-medium text-[var(--color-text)] truncate">
              {profile?.full_name ?? profile?.email ?? '—'}
            </p>
            <p className="text-xs text-[var(--color-text-faint)] capitalize">
              {profile?.role ?? '—'}
            </p>
          </div>
          <ChevronDown
            size={14}
            className="text-[var(--color-text-faint)] transition-transform duration-150"
            style={{ transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {accountOpen && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm transition-all duration-150 text-[var(--color-error)] hover:bg-[var(--color-surface-offset)]"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        )}
      </div>
    </aside>
    
  )
  
}