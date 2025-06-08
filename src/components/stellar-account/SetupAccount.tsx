
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { hapticFeedback } from "@/lib/haptics";

export function SetupAccount() {
  const { setupAccount, isSettingUp } = useStellarAccount();

  const handleSetupAccount = () => {
    hapticFeedback("medium");
    setupAccount();
  };

  return (
    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
      <p className="text-white/60">Set up your account to start sending money</p>
      <Button
        onClick={handleSetupAccount}
        disabled={isSettingUp}
        className="bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-500/90 hover:to-blue-600/90"
      >
        {isSettingUp ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting Up Account...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Set Up Account
          </>
        )}
      </Button>
    </CardContent>
  );
}
