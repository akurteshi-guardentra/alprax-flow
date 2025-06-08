
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TestTube } from "lucide-react";

interface TestDashboardLinkProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function TestDashboardLink({ 
  variant = "outline", 
  className = "" 
}: TestDashboardLinkProps) {
  const navigate = useNavigate();
  
  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => navigate("/test-dashboard")}
    >
      <TestTube className="mr-2 h-4 w-4" />
      Test Dashboard
    </Button>
  );
}
