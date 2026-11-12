export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded bg-line/70 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <SkeletonLine className="h-8 w-56" />
        <SkeletonLine className="h-4 w-80 max-w-full" />
      </div>
      <SkeletonLine className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonLine className="h-24 rounded-xl" />
        <SkeletonLine className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
