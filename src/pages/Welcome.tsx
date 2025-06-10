
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe, ArrowRight, Star, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Advanced encryption and multi-factor authentication protect your transactions"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Send money across borders in seconds, not days"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with recipients in over 180 countries worldwide"
    }
  ];

  const stats = [
    { value: "50M+", label: "Transactions" },
    { value: "180+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "Rating" }
  ];

  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-modern-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <AlpraxBrandHeader size="lg" />
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="glass-card-hover text-white border-none"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white modern-shadow"
            >
              Get Started
            </Button>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gradient-modern mb-6">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Global Finance
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Send money anywhere in the world instantly with blockchain technology. 
            Lower fees, faster transfers, and complete transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg modern-shadow animate-modern-glow"
            >
              Start Sending Money
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="glass-card-hover text-white border-white/20 px-8 py-4 text-lg"
            >
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card modern-shadow text-center">
              <CardContent className="p-6">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Why Choose Alprax?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-card modern-shadow h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-white/70">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-20"
        >
          <Card className="glass-card modern-shadow max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-white/90 mb-6">
                "Alprax has revolutionized how I send money to my family. 
                What used to take days now happens in seconds."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Sarah Chen</div>
                  <div className="text-white/70 text-sm">Business Owner</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <Card className="glass-card modern-shadow">
            <CardContent className="p-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-6 text-blue-400" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Finances?
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Join millions of users who trust Alprax for their global money transfers. 
                Sign up today and get your first transfer fee-free.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg modern-shadow"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
