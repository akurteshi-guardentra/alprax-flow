import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/10 backdrop-blur-sm shadow-lg",
        className
      )}
      {...props}
    />
  )
}

// Specialized skeleton components
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl",
        className
      )}
      {...props}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  )
}

function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn(
        "h-10 w-24 rounded-lg",
        className
      )}
      {...props}
    />
  )
}

function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn(
        "w-10 h-10 rounded-full",
        className
      )}
      {...props}
    />
  )
}

function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn(
        "h-4 w-full",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton, SkeletonCard, SkeletonButton, SkeletonAvatar, SkeletonText }