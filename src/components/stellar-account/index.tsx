import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStellarAccount } from "@/hooks/useStellarAccount";
import { LoadingState } from "./LoadingState";
import { SetupAccount } from "./SetupAccount";
import { AccountBalance } from "./AccountBalance";
import { AccountDetails } from "./AccountDetails";
import { Separator } from "@/components/ui/separator";

export function StellarAccount() {
  const { account, isLoading } = useStellarAccount();

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <LoadingState />
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Your Balance</CardTitle>
        </CardHeader>
        <SetupAccount />
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Your Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance display */}
        <AccountBalance />
        
        {/* Account ID section */}
        <AccountDetails />
      </CardContent>
    </Card>
  );
}

export * from "./AccountBalance";
export * from "./AccountDetails";
export * from "./LoadingState";
export * from "./SetupAccount";
