import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import StatusBadge, { STATUS_OPTIONS } from '../components/StatusBadge'
import CandidateModal from '../components/CandidateModal'
import { Search, Loader2, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('الكل')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const loadCandidates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('join_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCandidates(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCandidates()
  }, [])

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesStatus = statusFilter === 'الكل' || (c.status || 'جديد') === statusFilter
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        c.full_name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [candidates, statusFilter, search])

  return (
    <Layout>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">المتقدمون للمقابلات</h2>
          <p className="text-sm text-slate-400">{filtered.length} من أصل {candidates.length} متقدم</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف أو القسم..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="الكل">كل الحالات</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.value}
              </option>
            ))}
          </select>
          <button
            onClick={loadCandidates}
            className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">القسم</th>
              <th className="px-4 py-3 font-medium">الهاتف</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">الموعد المحدد</th>
              <th className="px-4 py-3 font-medium">المحاور</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  لا توجد نتائج مطابقة
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="cursor-pointer hover:bg-brand-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">{c.full_name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.department || '—'}</td>
                  <td className="px-4 py-3 text-slate-500" dir="ltr">
                    {c.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.selected_interview_time || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{c.interviewer_name || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <CandidateModal
          candidate={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null)
            loadCandidates()
          }}
        />
      )}
    </Layout>
  )
}
