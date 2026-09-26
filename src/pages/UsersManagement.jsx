import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import { Check, X, Loader2, ShieldCheck } from 'lucide-react'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const setApproval = async (id, is_approved) => {
    setBusyId(id)
    const { error } = await supabase.from('profiles').update({ is_approved }).eq('id', id)
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_approved } : u)))
    }
    setBusyId(null)
  }

  const setRole = async (id, role) => {
    setBusyId(id)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    }
    setBusyId(null)
  }

  return (
    <Layout>
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck className="text-brand-700" size={22} />
        <h2 className="text-lg font-bold text-slate-800">إدارة المستخدمين والصلاحيات</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">الدور</th>
              <th className="px-4 py-3 font-medium">حالة الحساب</th>
              <th className="px-4 py-3 font-medium">تاريخ التسجيل</th>
              <th className="px-4 py-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  لا يوجد مستخدمون
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-700">{u.full_name}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => setRole(u.id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="reviewer">مراجع (Reviewer)</option>
                      <option value="super_admin">مسؤول رئيسي (Super Admin)</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_approved ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        مفعّل
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        بانتظار الموافقة
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!u.is_approved ? (
                        <button
                          disabled={busyId === u.id}
                          onClick={() => setApproval(u.id, true)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Check size={14} /> موافقة
                        </button>
                      ) : (
                        <button
                          disabled={busyId === u.id}
                          onClick={() => setApproval(u.id, false)}
                          className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                        >
                          <X size={14} /> إلغاء التفعيل
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
