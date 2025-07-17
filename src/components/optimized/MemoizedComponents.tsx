import React, { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'

// Memoized card component for transaction lists
interface TransactionCardProps {
  id: string
  amount: number
  currency: string
  recipient: string
  date: string
  status: 'pending' | 'completed' | 'failed'
  onClick?: (id: string) => void
}

export const MemoizedTransactionCard = memo(function TransactionCard({
  id,
  amount,
  currency,
  recipient,
  date,
  status,
  onClick
}: TransactionCardProps) {
  const statusColor = useMemo(() => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }, [status])

  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }, [amount, currency])

  const formattedDate = useMemo(() => {
    return new Date(date).toLocaleDateString()
  }, [date])

  return (
    <div 
      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onClick?.(id)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium">{recipient}</span>
        <span className={cn('px-2 py-1 rounded-full text-xs', statusColor)}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">{formattedAmount}</span>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
    </div>
  )
})

// Memoized metric card for dashboard
interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
}

export const MemoizedMetricCard = memo(function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon
}: MetricCardProps) {
  const changeColor = useMemo(() => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }, [changeType])

  const formattedChange = useMemo(() => {
    if (change === undefined) return null
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${change}%`
  }, [change])

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {formattedChange && (
          <span className={cn('text-sm font-medium', changeColor)}>
            {formattedChange}
          </span>
        )}
      </div>
    </div>
  )
})

// Memoized list component for large datasets
interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  containerHeight: number
  keyExtractor: (item: T, index: number) => string
}

export function MemoizedVirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  keyExtractor
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleItems = useMemo(() => {
    const containerItemCount = Math.ceil(containerHeight / itemHeight)
    const totalItemCount = items.length
    
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + containerItemCount + 2, // +2 for buffer
      totalItemCount
    )

    return {
      startIndex: Math.max(0, startIndex - 1), // -1 for buffer
      endIndex,
      items: items.slice(
        Math.max(0, startIndex - 1),
        endIndex
      )
    }
  }, [items, itemHeight, containerHeight, scrollTop])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleItems.startIndex * itemHeight

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.items.map((item, index) => (
            <div key={keyExtractor(item, visibleItems.startIndex + index)}>
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}