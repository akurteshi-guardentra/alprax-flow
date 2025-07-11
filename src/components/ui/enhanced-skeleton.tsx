import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedSkeletonProps {
  variant?: 'default' | 'card' | 'transaction' | 'profile' | 'chart' | 'button'
  size?: 'sm' | 'md' | 'lg'
  count?: number
  animated?: boolean
  className?: string
}

const skeletonVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

const baseClasses = "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] rounded-md"

export function EnhancedSkeleton({ 
  variant = 'default',
  size = 'md', 
  count = 1,
  animated = true,
  className 
}: EnhancedSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn("p-4 border border-border rounded-lg space-y-3", className)}>
            <motion.div 
              className={cn(baseClasses, "h-4 w-3/4")}
              variants={animated ? skeletonVariants : undefined}
              animate={animated ? "animate" : undefined}
            />
            <div className="space-y-2">
              <motion.div 
                className={cn(baseClasses, "h-3 w-full")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
              <motion.div 
                className={cn(baseClasses, "h-3 w-5/6")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
            </div>
          </div>
        )

      case 'transaction':
        return (
          <div className={cn("flex items-center justify-between p-3 border border-border rounded-lg", className)}>
            <div className="flex items-center space-x-3">
              <motion.div 
                className={cn(baseClasses, "h-10 w-10 rounded-full")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
              <div className="space-y-2">
                <motion.div 
                  className={cn(baseClasses, "h-4 w-32")}
                  variants={animated ? skeletonVariants : undefined}
                  animate={animated ? "animate" : undefined}
                />
                <motion.div 
                  className={cn(baseClasses, "h-3 w-24")}
                  variants={animated ? skeletonVariants : undefined}
                  animate={animated ? "animate" : undefined}
                />
              </div>
            </div>
            <div className="text-right space-y-2">
              <motion.div 
                className={cn(baseClasses, "h-4 w-20")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
              <motion.div 
                className={cn(baseClasses, "h-3 w-16 ml-auto")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className={cn("flex items-center space-x-4 p-4", className)}>
            <motion.div 
              className={cn(baseClasses, "h-16 w-16 rounded-full")}
              variants={animated ? skeletonVariants : undefined}
              animate={animated ? "animate" : undefined}
            />
            <div className="space-y-2 flex-1">
              <motion.div 
                className={cn(baseClasses, "h-5 w-48")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
              <motion.div 
                className={cn(baseClasses, "h-4 w-32")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
              <motion.div 
                className={cn(baseClasses, "h-3 w-24")}
                variants={animated ? skeletonVariants : undefined}
                animate={animated ? "animate" : undefined}
              />
            </div>
          </div>
        )

      case 'chart':
        return (
          <div className={cn("space-y-4 p-4", className)}>
            <motion.div 
              className={cn(baseClasses, "h-6 w-32")}
              variants={animated ? skeletonVariants : undefined}
              animate={animated ? "animate" : undefined}
            />
            <div className="h-64 flex items-end justify-between space-x-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(baseClasses, "w-8")}
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                  variants={animated ? skeletonVariants : undefined}
                  animate={animated ? "animate" : undefined}
                />
              ))}
            </div>
          </div>
        )

      case 'button':
        const buttonSize = size === 'sm' ? 'h-8 w-20' : size === 'lg' ? 'h-12 w-32' : 'h-10 w-24'
        return (
          <motion.div 
            className={cn(baseClasses, buttonSize, className)}
            variants={animated ? skeletonVariants : undefined}
            animate={animated ? "animate" : undefined}
          />
        )

      default:
        const defaultSize = size === 'sm' ? 'h-3' : size === 'lg' ? 'h-6' : 'h-4'
        return (
          <motion.div 
            className={cn(baseClasses, defaultSize, "w-full", className)}
            variants={animated ? skeletonVariants : undefined}
            animate={animated ? "animate" : undefined}
          />
        )
    }
  }

  if (count === 1) {
    return renderSkeleton()
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

// Preset skeleton components for common use cases
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return <EnhancedSkeleton variant="transaction" count={count} />
}

export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <EnhancedSkeleton key={i} variant="card" />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return <EnhancedSkeleton variant="profile" />
}

export function ChartSkeleton() {
  return <EnhancedSkeleton variant="chart" />
}