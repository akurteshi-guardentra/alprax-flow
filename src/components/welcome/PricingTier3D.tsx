
import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';
import { Button3D } from './Button3D';
import { cn } from '@/lib/utils';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier3DProps {
  name: string;
  price: number;
  description: string;
  features: PricingFeature[];
  icon: ReactNode;
  popular?: boolean;
  ctaText?: string;
  onSelect?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  delay?: number;
}

export function PricingTier3D({
  name,
  price,
  description,
  features,
  icon,
  popular = false,
  ctaText = "Get Started",
  onSelect,
  primaryColor = "from-blue-500",
  secondaryColor = "to-indigo-600",
  delay = 0
}: PricingTier3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + delay * 0.1 }}
      className={cn(
        "relative p-px rounded-2xl bg-gradient-to-b from-white/5 to-transparent overflow-hidden",
        popular && "scale-105 md:scale-110 z-10"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border glow on hover */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-0 bg-gradient-to-r",
          primaryColor,
          secondaryColor
        )}
        animate={{ 
          opacity: isHovered ? 0.2 : 0 
        }}
        transition={{ duration: 0.3 }}
      />
      
      {popular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-4 py-1 rounded-bl-lg rounded-tr-xl z-20">
          Most Popular
        </div>
      )}
      
      {/* Card content container */}
      <div className={cn(
        "relative h-full rounded-2xl backdrop-blur-lg z-10 flex flex-col",
        popular ? "bg-gradient-to-b from-slate-800/80 to-slate-900/80" : "bg-gradient-to-b from-slate-800/50 to-slate-900/50"
      )}>
        <div className="p-6 md:p-8 flex-1">
          {/* Header section */}
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-r",
              primaryColor,
              secondaryColor,
              "bg-opacity-20"
            )}>
              {icon}
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-white">{name}</h3>
          </div>
          
          {/* Price section */}
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl md:text-4xl font-bold text-white">${price}</span>
              <span className="ml-2 text-white/70">/mo</span>
            </div>
            <p className="mt-2 text-white/70 text-sm md:text-base">{description}</p>
          </div>
          
          {/* Features list */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className={cn(
                "flex items-center",
                feature.included ? "text-white" : "text-white/40 line-through"
              )}>
                <Check 
                  className={cn(
                    "h-5 w-5 mr-2 flex-shrink-0",
                    feature.included ? "text-green-400" : "text-white/30"
                  )} 
                />
                <span className="text-sm">{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* CTA Button */}
        <div className="p-6 pt-0 md:p-8 md:pt-0">
          <Button3D
            variant={popular ? "primary" : "secondary"}
            onClick={onSelect}
            className="w-full"
          >
            {ctaText}
          </Button3D>
        </div>
      </div>
      
      {/* Background pulse effect for popular tier */}
      {popular && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl animate-pulse-slow"></div>
        </div>
      )}
    </motion.div>
  );
}
