import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm text-white/70">{text}</span>}
    </div>
  )
}

export function LoadingOverlay({ children, isLoading, text = "Loading..." }: {
  children: React.ReactNode
  isLoading: boolean
  text?: string
}) {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <LoadingSpinner size="lg" text={text} />
        </div>
      </div>
    </div>
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl p-6", className)}>
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    </div>
  )
}