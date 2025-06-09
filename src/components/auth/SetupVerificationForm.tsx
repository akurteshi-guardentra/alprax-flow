
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

interface SetupVerificationFormProps {
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const SetupVerificationForm = ({
  verificationCode,
  setVerificationCode,
  isLoading,
  onSubmit
}: SetupVerificationFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-white/80 text-center">
          Scan this QR code with your authenticator app, then enter the 6-digit code below
        </p>
        <div className="flex justify-center">
          <InputOTP 
            value={verificationCode} 
            onChange={setVerificationCode}
            maxLength={6}
            render={({ slots }) => (
              <InputOTPGroup className="gap-2">
                {slots.map((slot, index) => (
                  <InputOTPSlot 
                    key={index}
                    {...slot}
                    index={index}
                    className="bg-white/20 border-white/20 text-white"
                  />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-white text-blue-900 hover:bg-white/90"
        disabled={isLoading || verificationCode.length !== 6}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Verify & Complete Setup"
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-white/60">
          Keep your backup codes safe. You'll need them if you lose access to your authenticator app.
        </p>
      </div>
    </form>
  );
};
