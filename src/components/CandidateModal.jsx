import { useState } from 'react'
import { X, MessageCircle, Save, Loader2, CalendarClock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { STATUS_OPTIONS } from './StatusBadge'

// يحول رقم الهاتف المصري/العربي المحلي إلى صيغة دولية بسيطة لواجهة wa.me
function toWhatsAppNumber(raw) {
  if (!raw) return ''
  let digits = raw.replace(/[^\d]/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = '2' + digits // افتراض كود مصر +20، عدّل حسب الدولة
  return digits
}

export default function CandidateModal({ candidate, onClose, onSaved }) {
  const { profile } = useAuth()
  const [form, setForm] = useState({
    full_name: candidate.full_name || '',
    phone: candidate.phone || '',
    email: candidate.email || '',
    academic_year: candidate.academic_year || '',
    department: candidate.department || '',
    gender: candidate.gender || '',
    interests: candidate.interests || '',
    whatsapp: candidate.whatsapp || '',
    status: candidate.status || 'جديد',
    interview_notes: candidate.interview_notes || '',
    selected_interview_time: candidate.selected_interview_time || '',
    interviewer_name: candidate.interviewer_name || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const slots = Array.isArray(candidate.interview_slots)
    ? candidate.interview_slots
    : typeof candidate.interview_slots === 'string' && candidate.interview_slots
    ? candidate.interview_slots.split(',').map((s) => s.trim())
    : []

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('join_requests')
      .update({
        ...form,
        reviewed_by: profile?.full_name || profile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', candidate.id)

    setSaving(false)
    if (error) {
      setError('حدث خطأ أثناء الحفظ: ' + error.message)
      return
    }
    onSaved?.()
  }

  const handleWhatsApp = () => {
    const number = toWhatsAppNumber(form.whatsapp || form.phone)
    if (!number) return
    const time = form.selected_interview_time || 'قريباً (لم يتم تحديده بعد)'
    const message = `أهلاً بيك يا ${form.full_name}، تم تحديد موعد الإنترفيو الخاص بك يوم ${time}`
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">بيانات المتقدم</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل" value={form.full_name} onChange={(v) => update('full_name', v)} />
            <Field label="رقم الهاتف" value={form.phone} onChange={(v) => update('phone', v)} />
            <Field label="البريد الإلكتروني" value={form.email} onChange={(v) => update('email', v)} />
            <Field label="رقم الواتساب" value={form.whatsapp} onChange={(v) => update('whatsapp', v)} />
            <Field label="السنة الدراسية" value={form.academic_year} onChange={(v) => update('academic_year', v)} />
            <Field label="القسم" value={form.department} onChange={(v) => update('department', v)} />
            <Field label="النوع" value={form.gender} onChange={(v) => update('gender', v)} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">حالة الطلب</label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">الاهتمامات</label>
            <textarea
              value={form.interests}
              onChange={(e) => update('interests', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarClock size={16} className="text-brand-700" />
              تحديد موعد المقابلة
            </div>
            {slots.length === 0 ? (
              <p className="text-sm text-slate-400">لم يقم المتقدم باختيار أي مواعيد.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => update('selected_interview_time', slot)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      form.selected_interview_time === slot
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                الموعد النهائي المختار
              </label>
              <input
                value={form.selected_interview_time}
                onChange={(e) => update('selected_interview_time', e.target.value)}
                placeholder="مثال: الأحد 5 أكتوبر - 4:00 م"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">اسم المحاور (الشخص اللي عمل الإنترفيو)</label>
            <input
              value={form.interviewer_name}
              onChange={(e) => update('interviewer_name', e.target.value)}
              placeholder="مثال: مصطفى أحمد"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">ملاحظات المقابلة</label>
            <textarea
              value={form.interview_notes}
              onChange={(e) => update('interview_notes', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            {candidate.reviewed_by && (
              <p className="text-xs text-slate-400">
                آخر تعديل بواسطة: <span className="font-medium">{candidate.reviewed_by}</span>{' '}
                {candidate.reviewed_at && `في ${new Date(candidate.reviewed_at).toLocaleString('ar-EG')}`}
              </p>
            )}
            {candidate.interviewer_name && (
              <p className="text-xs text-slate-400">
                المحاور: <span className="font-medium text-brand-700">{candidate.interviewer_name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-between">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <MessageCircle size={18} />
            تأكيد الموعد عبر الواتساب
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}
