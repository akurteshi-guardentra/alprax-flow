
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface PurposeFieldProps {
  description: string;
  setDescription: (value: string) => void;
  className?: string;
}

export function PurposeField({ description, setDescription, className }: PurposeFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulate AI suggestions based on common transfer purposes
  useEffect(() => {
    const commonPurposes = [
      "Family Support",
      "Education Expenses",
      "Business Investment",
      "Medical Bills",
      "Travel Expenses",
      "Gift"
    ];
    
    // In a real app, this would be an AI-powered API call
    setSuggestions(commonPurposes.slice(0, 3));
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setDescription(suggestion);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-white flex items-center">
        Purpose
        <Sparkles className="h-4 w-4 text-blue-400 ml-2" />
      </Label>
      <Input
        type="text"
        placeholder="What's this for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 sm:h-12"
      />
      
      {!description && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-white/60 mr-1 mt-1">AI Suggestions:</span>
          {suggestions.map((suggestion) => (
            <Badge 
              key={suggestion}
              variant="outline" 
              className="bg-white/5 hover:bg-white/10 border-white/20 text-white cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
