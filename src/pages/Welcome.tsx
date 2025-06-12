
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedAppLayout } from "@/components/layout/UnifiedAppLayout";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Send money anywhere in seconds, not days",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&h=300"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your funds are protected with enterprise-grade encryption",
      image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=400&h=300"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Send money to over 180 countries worldwide",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&h=300"
    }
  ];

  const stats = [
    { value: "1M+", label: "Happy Users" },
    { value: "180+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
    { value: "$0", label: "Platform Fees" }
  ];

  return (
    <UnifiedAppLayout showBranding={false} className="space-y-12">
      <div className="text-center space-y-8">
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
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            The future of cross-border payments is here. Send money globally with the speed of blockchain 
            and the trust of traditional banking - completely FREE on Stellar testnet.
          </p>

          {/* Hero Image */}
          <div className="relative max-w-4xl mx-auto">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=400"
              alt="Global Money Transfer"
              className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full hover:bg-white/15 transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-lg rounded-full p-3">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
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
            className="bg-white text-blue-900 hover:bg-white/90 px-8 py-6 text-lg font-semibold"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
          >
            Sign In
          </Button>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-white/70 ml-2">4.9/5 from 10,000+ users</span>
          </div>
          <blockquote className="text-white/90 text-lg italic text-center">
            "AlpraxFlow revolutionized how we handle international payments. What used to take days now happens in seconds, 
            and we've saved thousands in fees. The security is unmatched."
          </blockquote>
          <cite className="text-white/70 text-sm mt-4 block text-center">
            — Sarah Chen, CEO of TechStartup Inc.
          </cite>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-white/40 text-sm"
        >
          Trusted by thousands of users worldwide • Powered by Stellar blockchain • Zero platform fees
        </motion.div>
      </div>
    </UnifiedAppLayout>
  );
};

export default Welcome;
