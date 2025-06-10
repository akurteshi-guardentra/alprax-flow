
import React from 'react';
import { OptimizedImage } from './optimized-image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, className: 'w-8 h-8' },
  md: { width: 48, height: 48, className: 'w-12 h-12' },
  lg: { width: 64, height: 64, className: 'w-16 h-16' }
};

export const TransactionAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className 
}: TransactionAvatarProps) => {
  const { width, height, className: sizeClassName } = sizeMap[size];
  
  const fallbackElement = (
    <div className={cn(
      'flex items-center justify-center bg-gray-200 rounded-full',
      sizeClassName,
      className
    )}>
      <User className="w-1/2 h-1/2 text-gray-500" />
    </div>
  );

  if (!src) {
    return fallbackElement;
  }

  return (
    <div className={cn('rounded-full overflow-hidden', sizeClassName, className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-full"
        lazyLoad={true}
        placeholderColor="#f3f4f6"
        onError={() => {
          // Handle error by showing fallback
        }}
      />
    </div>
  );
};
