
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCard3DProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  delay?: number;
}

export function FeatureCard3D({
  title,
  description,
  icon: Icon,
  className,
  primaryColor = 'from-purple-500',
  secondaryColor = 'to-pink-500',
  delay = 0
}: FeatureCard3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Calculate card rotation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate rotation (limited to +/- 10 degrees)
    const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 5;
    const rotateX = ((centerY - mouseY) / (rect.height / 2)) * 5;
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-xl group cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + delay * 0.1, duration: 0.5 }}
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'perspective(1000px)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.3s ease'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
      
      {/* Card border glow effect */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        'bg-gradient-to-r',
        primaryColor,
        secondaryColor
      )} style={{ filter: 'blur(15px)' }}></div>
      
      {/* Inner border */}
      <div className={cn(
        'absolute inset-[1px] rounded-[10px] bg-gradient-to-br from-slate-900 to-slate-800 z-10',
        'border border-white/5'
      )}></div>
      
      {/* Card content */}
      <div className="relative z-20 p-6 h-full">
        <div className="space-y-4">
          {/* Icon background */}
          <div className={cn(
            'bg-gradient-to-r p-3 inline-block rounded-lg',
            primaryColor,
            secondaryColor,
            'bg-opacity-20'
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-white/70">{description}</p>
        </div>
        
        {/* Interactive hover effect */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
      </div>
    </motion.div>
  );
}
