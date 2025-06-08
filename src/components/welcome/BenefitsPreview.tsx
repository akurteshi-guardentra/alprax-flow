
import { motion } from "framer-motion";
import { Globe, UserCircle2, Coins, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const benefitCards = [
  {
    icon: <Globe className="w-5 h-5 text-blue-400" />,
    translationKey: "global"
  },
  {
    icon: <UserCircle2 className="w-5 h-5 text-green-400" />,
    translationKey: "recipient"
  },
  {
    icon: <Coins className="w-5 h-5 text-yellow-400" />,
    translationKey: "rates"
  }
];

export function BenefitsPreview() {
  const { t } = useTranslation();

  return (
    <div className="relative p-6 bg-black/30 backdrop-blur-lg rounded-2xl shadow-xl">
      {/* Background Decorative Elements */}
      <div className="absolute -top-40 -right-40 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -bottom-40 -right-40 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 -left-40 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      
      {/* Preview Content */}
      <div className="relative z-10 space-y-6">
        <div className="p-4 bg-black/40 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-2">{t('welcome.title')}</h3>
          <p className="text-white/90">{t('welcome.description')}</p>
        </div>
        
        <div className="grid gap-4">
          {benefitCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-black/40 rounded-xl hover:bg-black/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {card.icon}
                <div>
                  <h4 className="text-white font-medium">
                    {t(`benefits.${card.translationKey}.title`)}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {t(`benefits.${card.translationKey}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Business Model Section */}
        <Card className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-none">
          <CardHeader>
            <CardTitle className="text-white text-lg">{t('revenue.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg hover:bg-black/50 transition-colors">
                <div>
                  <h5 className="text-white font-medium">{t('revenue.exchange.title')}</h5>
                  <p className="text-sm text-white/80">{t('revenue.exchange.description')}</p>
                </div>
                <ArrowUpRight className="text-green-400" />
              </div>
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg hover:bg-black/50 transition-colors">
                <div>
                  <h5 className="text-white font-medium">{t('revenue.premium.title')}</h5>
                  <p className="text-sm text-white/80">{t('revenue.premium.description')}</p>
                </div>
                <ArrowUpRight className="text-yellow-400" />
              </div>
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg hover:bg-black/50 transition-colors">
                <div>
                  <h5 className="text-white font-medium">{t('revenue.partnerships.title')}</h5>
                  <p className="text-sm text-white/80">{t('revenue.partnerships.description')}</p>
                </div>
                <ArrowUpRight className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
