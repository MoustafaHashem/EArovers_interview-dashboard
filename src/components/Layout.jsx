import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Users, ShieldCheck, LayoutGrid } from 'lucide-react'

export default function Layout({ children }) {
  const { profile, signOut, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navItem = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        location.pathname === to
          ? 'bg-brand-700 text-white'
          : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800">لوحة تحكم المقابلات</h1>
              <p className="text-xs text-slate-400">إدارة المتقدمين والمواعيد</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItem('/', 'المتقدمون', Users)}
            {isSuperAdmin && navItem('/users', 'إدارة المستخدمين', ShieldCheck)}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-700">{profile?.full_name}</p>
              <p className="text-xs text-slate-400">
                {profile?.role === 'super_admin' ? 'مسؤول رئيسي' : 'مراجع'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 border-t border-slate-100 px-4 py-2 sm:hidden">
          {navItem('/', 'المتقدمون', Users)}
          {isSuperAdmin && navItem('/users', 'إدارة المستخدمين', ShieldCheck)}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
