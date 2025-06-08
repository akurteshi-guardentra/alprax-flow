
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, PlayCircle } from "lucide-react";
import { toast } from 'sonner';
import { useTestAccountContext } from '@/contexts/TestAccountContext';

export function TransactionSimulator() {
  const [scenarioType, setScenarioType] = useState<string>("success");
  const [delay, setDelay] = useState<number[]>([2]); // Delay in seconds
  const [showTimeline, setShowTimeline] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const { activeAccount } = useTestAccountContext();

  const handleSimulate = () => {
    if (!activeAccount) {
      toast.error("Please select a test account first");
      return;
    }

    setIsSimulating(true);
    toast.info(`Starting ${scenarioType} transaction simulation with ${delay[0]}s delay`);
    
    // In a real implementation, this would trigger actual transaction simulation
    // For now, we just show a toast after the delay
    setTimeout(() => {
      switch (scenarioType) {
        case "success":
          toast.success("Transaction completed successfully");
          break;
        case "slow":
          toast.info("Transaction is taking longer than usual", {
            duration: 5000,
          });
          setTimeout(() => toast.success("Transaction finally completed"), 4000);
          break;
        case "failure":
          toast.error("Transaction failed: Network error");
          break;
        default:
          toast.info("Simulation complete");
      }
      setIsSimulating(false);
    }, delay[0] * 1000);
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-white">
          <PlayCircle className="mr-2 h-5 w-5 text-primary" />
          Transaction Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">Scenario Type</Label>
          <Select 
            defaultValue={scenarioType} 
            onValueChange={setScenarioType}
            disabled={isSimulating}
          >
            <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select a scenario" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="slow">Slow Processing</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-white">Simulation Delay</Label>
            <Badge variant="outline" className="text-white">
              <Clock className="mr-1 h-3 w-3" />
              {delay[0]}s
            </Badge>
          </div>
          <Slider
            defaultValue={[2]}
            max={10}
            min={1}
            step={1}
            onValueChange={setDelay}
            disabled={isSimulating}
            className="py-2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-timeline" className="text-white cursor-pointer">
            Show Timeline
          </Label>
          <Switch
            id="show-timeline"
            checked={showTimeline}
            onCheckedChange={setShowTimeline}
            disabled={isSimulating}
          />
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleSimulate} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSimulating || !activeAccount}
          >
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </Button>
          
          {!activeAccount && (
            <p className="text-amber-400 text-xs flex items-center mt-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Please select a test account first
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
