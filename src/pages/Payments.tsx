
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Building, Wallet, Plus } from "lucide-react";

const Payments = () => {
  const navigate = useNavigate();

  const paymentMethods = [
    {
      id: 1,
      type: "Credit Card",
      icon: CreditCard,
      details: "Visa ending in 4242",
      default: true,
    },
    {
      id: 2,
      type: "Bank Account",
      icon: Building,
      details: "Bank of Kosovo ****1234",
      default: false,
    },
    {
      id: 3,
      type: "Digital Wallet",
      icon: Wallet,
      details: "Connected",
      default: false,
    },
  ];

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
          <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                Payment Methods
              </CardTitle>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none bg-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-full bg-white/10">
                              <method.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{method.type}</p>
                              <p className="text-sm text-white/60">{method.details}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {method.default && (
                              <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                                Default
                              </span>
                            )}
                            <Button variant="ghost" className="text-white hover:bg-white/10">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Payments;
