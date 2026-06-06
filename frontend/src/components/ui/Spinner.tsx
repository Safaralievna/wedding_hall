export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`} role="status" aria-label="Yuklanmoqda">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-rose-500" />
    </div>
  );
}
