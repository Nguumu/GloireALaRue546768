export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-surface-200 p-4 dark:border-surface-800">
      <p className="text-xs text-surface-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-surface-400">{hint}</p>}
    </div>
  );
}
