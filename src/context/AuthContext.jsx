import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return null
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('خطأ في جلب بيانات الحساب:', error.message)
      setProfile(null)
      return null
    }
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)
        if (newSession?.user) {
          await fetchProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  // تسجيل مستخدم جديد كـ Reviewer (بانتظار موافقة السوبر أدمن)
  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    if (error) return { error }

    // صف الـ profile يُنشأ تلقائياً عبر الـ trigger (handle_new_user) في قاعدة البيانات
    return { data }
  }

  // تسجيل الدخول، مع رفض الدخول إذا لم تتم الموافقة على الحساب بعد
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }

    const userProfile = await fetchProfile(data.user.id)

    if (!userProfile) {
      await supabase.auth.signOut()
      return { error: { message: 'تعذر العثور على بيانات الحساب.' } }
    }

    if (!userProfile.is_approved) {
      await supabase.auth.signOut()
      return {
        error: {
          message: 'حسابك قيد المراجعة، برجاء انتظار موافقة المسؤول (Super Admin) قبل الدخول.',
          code: 'NOT_APPROVED',
        },
      }
    }

    return { data, profile: userProfile }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSession(null)
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isSuperAdmin: profile?.role === 'super_admin',
    signUp,
    signIn,
    signOut,
    refreshProfile: () => fetchProfile(session?.user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth يجب أن يُستخدم داخل AuthProvider')
  return ctx
}
