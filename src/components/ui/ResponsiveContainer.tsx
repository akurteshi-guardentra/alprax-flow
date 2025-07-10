import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'wide';
}

export function ResponsiveContainer({ 
  children, 
  className,
  variant = 'default' 
}: ResponsiveContainerProps) {
  const variants = {
    default: 'p-4 sm:p-6 lg:p-8',
    compact: 'p-2 sm:p-4 lg:p-6',
    wide: 'p-6 sm:p-8 lg:p-12'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      'max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 4
}: ResponsiveGridProps) {
  const gridCols = cn(
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`
  );

  return (
    <div className={cn('grid', gridCols, className)}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    default?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
  };
  spacing?: number;
}

export function ResponsiveStack({ 
  children, 
  className,
  direction = { default: 'col', lg: 'row' },
  spacing = 4
}: ResponsiveStackProps) {
  const flexDirection = cn(
    direction.default === 'row' ? 'flex-row' : 'flex-col',
    direction.sm === 'row' ? 'sm:flex-row' : direction.sm === 'col' ? 'sm:flex-col' : '',
    direction.md === 'row' ? 'md:flex-row' : direction.md === 'col' ? 'md:flex-col' : '',
    direction.lg === 'row' ? 'lg:flex-row' : direction.lg === 'col' ? 'lg:flex-col' : ''
  );

  const gapClass = direction.default === 'row' ? `gap-x-${spacing}` : `gap-y-${spacing}`;

  return (
    <div className={cn('flex', flexDirection, gapClass, className)}>
      {children}
    </div>
  );
}