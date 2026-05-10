export default function Skeleton({ count = 3 }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-6 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-4 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
