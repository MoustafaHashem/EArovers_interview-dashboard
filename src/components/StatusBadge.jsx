export const STATUS_OPTIONS = [
  { value: 'جديد', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'تم تحديد موعد', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  { value: 'مقبول', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { value: 'مرفوض', color: 'bg-red-50 text-red-700 border-red-300' },
  { value: 'مؤجل', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'لم يحضر', color: 'bg-zinc-100 text-zinc-600 border-zinc-300' },
]

export function getStatusColor(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color || STATUS_OPTIONS[0].color
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status || 'جديد'}
    </span>
  )
}
