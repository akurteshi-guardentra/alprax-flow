
import { CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <CardContent className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 text-white animate-spin" />
    </CardContent>
  );
}
