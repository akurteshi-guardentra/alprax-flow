
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReferral } from '@/hooks/useReferral';
import { Gift, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReferralProgram() {
  const { referralCode, generateReferralCode, isGenerating } = useReferral();

  const copyToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success('Referral code copied to clipboard');
    }
  };

  const handleGenerateCode = () => {
    generateReferralCode();
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Gift className="h-5 w-5 text-kosovo-yellow" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralCode ? (
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-white/70">Your Referral Code:</p>
              <p className="text-xl font-mono text-white">{referralCode.code}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={copyToClipboard}
                className="flex-1"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button 
                onClick={() => {
                  toast.success('Sharing options will be available soon');
                }}
                className="flex-1"
                variant="outline"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="text-center text-white/70">
              <p>Rewards Earned: {referralCode.rewards_earned} KSV</p>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Referral Code'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
