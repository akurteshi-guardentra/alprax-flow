import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedReferral } from '@/hooks/useEnhancedReferral';
import { 
  Gift, 
  Copy, 
  Share2, 
  QrCode, 
  TrendingUp, 
  Users, 
  Award,
  Mail,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function EnhancedReferralProgram() {
  const { 
    referralCode, 
    analytics, 
    generateReferralCode, 
    generateQRCode, 
    isGenerating,
    isGeneratingQR 
  } = useEnhancedReferral();
  
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const shareToWhatsApp = () => {
    if (referralCode?.referral_link) {
      const message = `🚀 Join me on Alprax - the best way to send money to Kosovo & Albania! 

Get instant transfers with zero fees and earn rewards. Use my referral link: ${referralCode.referral_link}

💰 We both earn KSV tokens when you join!
🇽🇰🇦🇱 Built for our diaspora community`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const shareToTelegram = () => {
    if (referralCode?.referral_link) {
      const message = `🚀 Join Alprax - Zero-fee transfers to Kosovo & Albania!\n\nUse my link: ${referralCode.referral_link}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralCode.referral_link)}&text=${encodeURIComponent(message)}`;
      window.open(telegramUrl, '_blank');
    }
  };

  const shareViaEmail = () => {
    if (referralCode?.referral_link) {
      const subject = 'Join me on Alprax - Zero-fee money transfers';
      const body = `Hi,

I've been using Alprax to send money back home to Kosovo/Albania and it's amazing! Zero fees, instant transfers, and we both earn rewards.

Join using my referral link: ${referralCode.referral_link}

Benefits:
• Zero transfer fees
• Instant transfers
• Earn KSV tokens with every transfer
• Built specifically for our diaspora community

Looking forward to having you on board!`;

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!referralCode) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-kosovo-yellow" />
            Enhanced Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-white/70">
              Join our enhanced referral program and earn rewards while helping your community!
            </p>
            <Button 
              onClick={() => generateReferralCode()}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? 'Generating...' : 'Start Earning Referral Rewards'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Gift className="h-5 w-5 text-kosovo-yellow" />
          Enhanced Referral Program
          <Badge className={getTierColor(referralCode.tier_level)}>
            {referralCode.tier_level.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="share" className="text-white data-[state=active]:bg-white/20">
              Share
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Your Referral Code:</span>
                <Badge variant="outline" className="text-white border-white/20">
                  {referralCode.family_bonus_multiplier > 1 && '👨‍👩‍👧‍👦'} Family Bonus: {referralCode.family_bonus_multiplier}x
                </Badge>
              </div>
              <p className="text-xl font-mono text-white">{referralCode.code}</p>
              <p className="text-sm text-white/70 break-all">{referralCode.referral_link}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-kosovo-yellow">{referralCode.total_clicks}</div>
                <div className="text-sm text-white/70">Total Clicks</div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-kosovo-yellow">{referralCode.successful_conversions}</div>
                <div className="text-sm text-white/70">Conversions</div>
              </div>
            </div>

            {analytics?.tierProgress && (
              <div className="bg-white/10 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Progress to {analytics.tierProgress.next}</span>
                  <span className="text-sm text-white/70">
                    {analytics.tierProgress.nextTierRequirement} more needed
                  </span>
                </div>
                <Progress 
                  value={analytics.tierProgress.progressPercentage} 
                  className="h-2"
                />
              </div>
            )}

            <div className="text-center">
              <div className="text-3xl font-bold text-kosovo-yellow">
                {referralCode.rewards_earned} KSV
              </div>
              <div className="text-sm text-white/70">Total Rewards Earned</div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => copyToClipboard(referralCode.code, 'Referral code')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              
              <Button 
                onClick={() => copyToClipboard(referralCode.referral_link || '', 'Referral link')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-medium">Share on Social Media</h4>
              
              <Button 
                onClick={shareToWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share on WhatsApp
              </Button>
              
              <Button 
                onClick={shareToTelegram}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Share on Telegram
              </Button>
              
              <Button 
                onClick={shareViaEmail}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => generateQRCode()}
                disabled={isGeneratingQR}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
              </Button>
              
              {referralCode.qr_code_url && (
                <div className="text-center">
                  <img 
                    src={referralCode.qr_code_url} 
                    alt="Referral QR Code"
                    className="mx-auto rounded-lg"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-kosovo-yellow" />
                      <span className="text-sm text-white/70">Conversion Rate</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {analytics.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-kosovo-yellow" />
                      <span className="text-sm text-white/70">Monthly Referrals</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {referralCode.monthly_referrals}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Monthly Performance
                  </h4>
                  <div className="space-y-2">
                    {analytics.monthlyStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-white/70">{stat.month}</span>
                        <div className="text-right">
                          <div className="text-white font-medium">{stat.conversions} conversions</div>
                          <div className="text-kosovo-yellow text-sm">{stat.earnings} KSV</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}