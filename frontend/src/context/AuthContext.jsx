import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (!session?.user) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch {
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'INITIAL_SESSION' && session?.user) {
          setUser(session.user)
          try {
            const { data } = await authApi.getMe()
            if (mounted) setProfile(data)
          } catch (e) {
            if (mounted) setProfile(null)
          } finally {
            if (mounted) setLoading(false)
          }
        }

        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }

        if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isAdmin = profile?.role === 'admin'
  const isViewer   = profile?.role === 'viewer'
  const isFamilia  = profile?.familia === true  
  const isEditor   = isAdmin                    

  const value = {
    user,
    profile,
    loading,
    setProfile,
    logout,
    isAdmin,
    isViewer,
    isFamilia,
    isEditor,
    loginWithGoogle,
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/items'
      }
    })
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}