
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const Cards = () => {
  const navigate = useNavigate();
  const [showCardNumber, setShowCardNumber] = useState(false);

  // This is a placeholder for future integration with Stellar anchors or payment methods
  // In the future, this could be connected to Stellar-compatible payment methods or anchors
  const [isIntegrationAvailable, setIsIntegrationAvailable] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-kosovo-blue via-kosovo-blue/90 to-red-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Your Cards
              </h1>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Card
              </Button>
            </div>

            <div className="grid gap-4">
              {isIntegrationAvailable ? (
                <p className="text-white">Connected payment methods will appear here.</p>
              ) : (
                <div className="space-y-4">
                  <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm overflow-hidden border border-white/10">
                    <CardContent className="p-6">
                      <div className="space-y-6 text-center">
                        <div className="relative mx-auto w-64 h-40 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg flex flex-col justify-between p-4 overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                              <path fill="white" d="M42.7,-62.9C56.7,-55.1,70.3,-43.9,77.4,-29.2C84.4,-14.5,84.9,3.7,78.6,18.8C72.3,33.9,59.3,45.9,45.2,53.8C31.1,61.7,15.6,65.5,-0.2,65.8C-16,66.1,-32,62.9,-45.9,54.8C-59.8,46.7,-71.5,33.7,-77.3,17.8C-83.1,1.9,-82.9,-16.9,-75.1,-31.2C-67.3,-45.5,-51.9,-55.3,-37,-62.1C-22.1,-68.9,-7.7,-72.7,6.9,-72.8C21.5,-72.9,28.7,-70.7,42.7,-62.9Z" transform="translate(100 100)" />
                            </svg>
                          </div>                            <div className="flex justify-between items-start">
                            <div className="text-white text-left">
                              <p className="text-xs opacity-80">Digital Payments</p>
                              <p className="font-bold">ALPRAX CARD</p>
                            </div>
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>                          <div className="flex justify-between items-end">
                            <div className="text-white text-left">
                              <p className="text-xs opacity-80">Coming Soon</p>
                              <p className="font-mono">••••  ••••  ••••  ••••</p>
                            </div>
                            <div className="text-white">
                              <p className="text-xs opacity-80">Powered by</p>
                              <p className="font-bold text-sm">Alprax</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-medium text-white">Connect Payment Methods</h3>                          <p className="text-white/60 mt-2">
                            This feature will allow you to connect various payment methods to your account.
                            Integration with payment providers and banking systems coming soon.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <Button className="bg-primary hover:bg-primary/90 text-white w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Connect Payment Method
                          </Button>                          <p className="text-xs text-white/40">
                            Connect your existing debit cards, credit cards, or bank accounts for seamless 
                            transfers and payments with low transaction fees.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cards;
