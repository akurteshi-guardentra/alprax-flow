import React, { useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProgressDemoProps {
  className?: string;
}

export const ProgressDemo = ({ className = "" }: ProgressDemoProps) => {
  const [value, setValue] = useState(45);
  const [showLabel, setShowLabel] = useState(false);
  const [variant, setVariant] = useState<"default" | "striped" | "indeterminate">("default");
  const { shouldAnimate } = useOptimizedAnimations();

  const increment = () => setValue(prev => Math.min(prev + 10, 100));
  const decrement = () => setValue(prev => Math.max(prev - 10, 0));
  
  const cycleVariant = () => {
    if (variant === "default") setVariant("striped");
    else if (variant === "striped") setVariant("indeterminate");
    else setVariant("default");
  };

  return (
    <Card className={`border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Progress Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={variant === "indeterminate" ? undefined : value} 
            className="h-4" 
            indicatorClassName={
              value < 30 ? "bg-red-500" : 
              value < 70 ? "bg-yellow-500" : 
              "bg-green-500"
            }
            showValueLabel={showLabel}
            variant={variant}
            isLowEndDevice={!shouldAnimate}
          />
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Current value: {value}%</span>
            <span>Variant: {variant}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-label" 
            checked={showLabel}
            onCheckedChange={setShowLabel}
          />
          <Label htmlFor="show-label" className="text-white">Show value label</Label>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={decrement} 
            variant="outline" 
            size="sm"
            disabled={value === 0 || variant === "indeterminate"}
            className="border-white/10 text-white"
          >
            Decrease
          </Button>
          <Button 
            onClick={increment} 
            variant="outline" 
            size="sm"
            disabled={value === 100 || variant === "indeterminate"}
            className="border-white/10 text-white"
          >
            Increase
          </Button>
          <Button 
            onClick={cycleVariant} 
            variant="outline" 
            size="sm"
            className="border-white/10 text-white ml-auto"
          >
            Change Variant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
