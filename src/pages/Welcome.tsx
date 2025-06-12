
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { Card, CardContent } from "@/components/ui/card";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Send money anywhere in seconds, not days"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds are protected with enterprise-grade encryption"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Send money to over 180 countries worldwide"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-500/15 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-8 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AlpraxBrandHeader size="xl" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  The future of cross-border payments is here. Send money globally with the speed of blockchain 
                  and the trust of traditional banking.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full">
                        <CardContent className="p-6 text-center">
                          <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                            <feature.icon className="h-6 w-6 text-blue-400" />
                          </div>
                          <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                          <p className="text-white/70 text-sm">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
              >
                <Button
                  onClick={() => navigate("/signup")}
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-white/90 px-8 py-6 text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  Sign In
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="text-white/40 text-sm mt-8"
              >
                Trusted by thousands of users worldwide • Secured by Stellar blockchain
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
