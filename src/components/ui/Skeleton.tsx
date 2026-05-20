import clsx from "clsx";

function base(className?: string) {
  return clsx("animate-pulse rounded-2xl bg-forest/10", className);
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-5 shadow-sm">
      <div className={base("h-44 w-full")} />
      <div className="mt-5 flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonText className="h-4 w-2/3" />
          <SkeletonText className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText className="mt-5 h-4 w-full" />
      <SkeletonText className="mt-2 h-4 w-5/6" />
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={base(clsx("h-4", className))} />;
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <div className={base(clsx("h-12 w-12 rounded-full", className))} />;
}

export function SkeletonStat() {
  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-5">
      <SkeletonText className="h-3 w-24" />
      <SkeletonText className="mt-4 h-8 w-20" />
    </div>
  );
}
