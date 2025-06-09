import { Progress } from "@/components/ui/progress";
import { Profile } from "@/types/profile";
import { motion } from "framer-motion";
import { useProfileCompletion } from "@/hooks/use-profile-completion";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, BarChart2, Shield } from "lucide-react";

interface ProfileCompletionCardProps {
  profile: Profile | null;
  className?: string;
  compact?: boolean;
  onAddMissing?: (field: string) => void;
}

export const ProfileCompletionCard = ({ 
  profile, 
  className = "", 
  compact = false,
  onAddMissing
}: ProfileCompletionCardProps) => {
  const { percentage, missing, completed } = useProfileCompletion(profile);
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  
  // Determine color based on completion percentage
  const getProgressColor = () => {
    if (percentage < 40) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Get friendly status message
  const getStatusMessage = () => {
    if (percentage < 40) return "Just getting started";
    if (percentage < 70) return "Making progress";
    if (percentage < 100) return "Almost there";
    return "Profile complete!";
  };

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition({ duration: 0.3 })}
      className={`rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-white">Profile Completion</h3>
        </div>
        <span className="text-sm font-medium text-white">{percentage}%</span>
      </div>      <Progress 
        value={percentage} 
        className="h-2 bg-white/10" 
        indicatorClassName={getProgressColor()}
        variant={percentage === 100 ? "striped" : "default"}
        label="Profile completion progress"
      />
      
      {!compact && (
        <>
          <p className="text-xs text-white/70 mt-2">{getStatusMessage()}</p>
          
          {percentage < 100 && (
            <div className="mt-3 space-y-2">
              {missing.length > 0 && (
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-1 text-white/80">
                    <AlertTriangle className="h-3 w-3 text-yellow-400" />
                    <span>Still needed:</span>
                  </p>
                  <ul className="pl-5 list-disc text-xs text-white/60 space-y-1">
                    {missing.map((field, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{field}</span>
                        {onAddMissing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onAddMissing(field)}
                            className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                          >
                            Add
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {percentage === 100 && (
            <div className="mt-3 flex items-center text-sm gap-2 text-green-400">
              <Shield className="h-4 w-4" />
              <span>Your profile is complete!</span>
            </div>
          )}
          
          {percentage >= 80 && profile?.kyc_level !== 'verified' && (
            <div className="mt-3 bg-blue-500/10 rounded p-2 text-xs text-white/80 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Complete your profile and verify your identity to unlock all features.</span>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
