
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button3D } from '@/components/welcome/Button3D';
import { hapticFeedback } from '@/lib/haptics';

interface EnhancedActionButtonProps {
  children: ReactNode;
  to: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: ReactNode;
  className?: string;
}

export function EnhancedActionButton({
  children,
  to,
  variant = 'primary',
  icon,
  className
}: EnhancedActionButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Enhanced haptic feedback pattern
    hapticFeedback('medium');
    
    // Add a subtle animation before navigation for better UX
    setTimeout(() => {
      navigate(to);
    }, 150); // Slightly longer delay for better feedback
  };
  
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ y: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Button3D 
        variant={variant} 
        onClick={handleClick}
        icon={icon}
        className={className}
      >
        {children}
      </Button3D>
    </motion.div>
  );
}
