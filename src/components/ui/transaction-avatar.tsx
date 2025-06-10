
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';

export interface TransactionAvatarProps {
  src?: string;
  name?: string;
  type: 'sender' | 'recipient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TransactionAvatar = ({ 
  src, 
  name = '', 
  type, 
  size = 'md', 
  className 
}: TransactionAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const typeColors = {
    sender: 'bg-blue-500/20 text-blue-400',
    recipient: 'bg-green-500/20 text-green-400'
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src ? (
        <OptimizedImage
          src={src}
          alt={name}
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="w-full h-full object-cover"
          lazyLoad
          placeholderColor="rgba(255, 255, 255, 0.1)"
        />
      ) : (
        <AvatarFallback className={cn(typeColors[type], 'text-xs font-medium')}>
          {name ? getInitials(name) : type === 'sender' ? 'S' : 'R'}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default TransactionAvatar;
