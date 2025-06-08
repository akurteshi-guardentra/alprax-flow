import React from 'react';
import { useDataSaverMode } from '@/hooks/use-data-saver';
import { OptimizedImage } from './optimized-image';

interface TransactionAvatarProps {
  src: string | null;
  name?: string;
  type?: 'sender' | 'recipient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * An optimized component for displaying transaction avatar images
 * - Handles data saver mode
 * - Shows appropriate fallback images
 * - Optimizes loading based on network conditions
 */
export function TransactionAvatar({
  src,
  name = '',
  type = 'recipient',
  size = 'md',
  className = ''
}: TransactionAvatarProps) {
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  
  // Determine dimensions based on size
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  }[size];
  
  // Generate initials from name
  const getInitials = () => {
    if (!name) return type === 'sender' ? 'S' : 'R';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };
  
  // Get background color based on name or type
  const getBackgroundColor = () => {
    if (!name) {
      return type === 'sender' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600';
    }
    
    // Generate consistent color based on name
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-amber-100 text-amber-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600',
    ];
    
    // Simple hash of name to pick a consistent color
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // If there's no image src or data saver is enabled, show initials
  if (!src || isDataSaverEnabled) {
    return (
      <div 
        className={`flex items-center justify-center rounded-full ${getBackgroundColor()} ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <span className="font-medium">{getInitials()}</span>
      </div>
    );
  }
  
  // Otherwise, use optimized image with fallbacks
  return (
    <OptimizedImage
      src={src}
      alt={name || type}
      width={dimensions.width}
      height={dimensions.height}
      className={`rounded-full object-cover ${className}`}
      // Only use progressive loading on better connections/devices
      lazyLoad={true}
      // Use color placeholder that matches the initials background
      placeholderColor={isLowEndDevice ? '#f3f4f6' : '#e2e8f0'}
      fallback={
        <div 
          className={`flex items-center justify-center rounded-full ${getBackgroundColor()} ${className}`}
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          <span className="font-medium">{getInitials()}</span>
        </div>
      }
    />
  );
}
