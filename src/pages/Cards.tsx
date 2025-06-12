
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus, MoreVertical, Shield, Wallet, Smartphone } from "lucide-react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";

const Cards = () => {
  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      last4: "4532",
      expiryMonth: "12",
      expiryYear: "25",
      isDefault: true,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "8901",
      expiryMonth: "08",
      expiryYear: "26",
      isDefault: false,
      color: "from-red-500 to-red-600"
    }
  ];

  const walletOptions = [
    {
      name: "Stellar Wallet",
      balance: "150.25 EUR",
      address: "GDQNY...7XYZ",
      isActive: true,
      icon: Wallet
    },
    {
      name: "Mobile Wallet",
      balance: "Coming Soon",
      address: "Connect your mobile wallet",
      isActive: false,
      icon: Smartphone
    }
  ];

  return (
    <UnifiedLayout title="Payment Methods">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Stellar Wallets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-400" />
                Stellar Wallets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletOptions.map((wallet, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors ${
                    wallet.isActive 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        wallet.isActive ? 'bg-green-500/20' : 'bg-white/10'
                      }`}>
                        <wallet.icon className={`h-5 w-5 ${
                          wallet.isActive ? 'text-green-400' : 'text-white/60'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{wallet.name}</h3>
                        <p className="text-white/60 text-sm">{wallet.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{wallet.balance}</p>
                      {wallet.isActive && (
                        <span className="text-green-400 text-xs">Active</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Credit Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  Credit & Debit Cards
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((card) => (
                <div key={card.id} className="relative">
                  <div className={`p-6 rounded-xl bg-gradient-to-r ${card.color} text-white relative overflow-hidden`}>
                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full"></div>
                      <div className="absolute top-6 right-6 w-8 h-8 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="text-sm opacity-90">AlpraxFlow</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-lg font-mono tracking-wider">
                          •••• •••• •••• {card.last4}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs opacity-70">EXPIRES</div>
                            <div className="font-mono">{card.expiryMonth}/{card.expiryYear}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{card.type}</div>
                            {card.isDefault && (
                              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">Default</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-green-400" />
                <h3 className="text-white font-medium">Security & Protection</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-green-400 font-medium">256-bit Encryption</p>
                  <p className="text-white/70">Bank-level security</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-blue-400 font-medium">PCI Compliant</p>
                  <p className="text-white/70">Industry standard</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-purple-400 font-medium">Fraud Protection</p>
                  <p className="text-white/70">24/7 monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white justify-start">
              <Plus className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Add Bank Account</div>
                <div className="text-sm text-white/60">Link your bank for easier funding</div>
              </div>
            </Button>
            <Button className="h-16 bg-white/5 hover:bg-white/10 border border-white/10 text-white justify-start">
              <Shield className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Security Settings</div>
                <div className="text-sm text-white/60">Manage payment security</div>
              </div>
            </Button>
          </div>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Cards;
