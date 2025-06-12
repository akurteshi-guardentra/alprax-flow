
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Building, Wallet, Plus, MoreVertical } from "lucide-react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Badge } from "@/components/ui/badge";

const Cards = () => {
  const paymentMethods = [
    {
      id: 1,
      type: "Credit Card",
      icon: CreditCard,
      details: "Visa ending in 4242",
      default: true,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      type: "Bank Account",
      icon: Building,
      details: "Bank of Kosovo ****1234",
      default: false,
      color: "from-green-500 to-green-600"
    },
    {
      id: 3,
      type: "Digital Wallet",
      icon: Wallet,
      details: "Connected",
      default: false,
      color: "from-purple-500 to-purple-600"
    },
  ];

  return (
    <UnifiedLayout title="Payment Methods">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Your Payment Methods</h2>
            <p className="text-white/70">Manage your cards and bank accounts</p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{method.type}</h3>
                      {method.default && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">{method.details}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10">
                      Edit
                    </Button>
                    {!method.default && (
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        Set Default
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add New Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Add New Payment Method</h3>
              <p className="text-white/70 text-sm mb-4">
                Connect your bank account, credit card, or digital wallet for seamless transactions
              </p>
              <Button className="bg-white text-blue-900 hover:bg-white/90">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <h4 className="text-white font-medium mb-2">Security & Privacy</h4>
              <p className="text-white/70 text-sm">
                All payment methods are secured with bank-level encryption. We never store your full card details 
                and use tokenization for maximum security.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Cards;
