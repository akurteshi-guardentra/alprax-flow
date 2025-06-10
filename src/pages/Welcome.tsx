
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe, ArrowRight, Star, Users, TrendingUp, Sparkles, Lock, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlpraxBrandHeader } from "@/components/brand/AlpraxLogo";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Advanced encryption, multi-signature protocols, and real-time fraud detection",
      gradient: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30"
    },
    {
      icon: Zap,
      title: "Lightning Fast Transfers",
      description: "Instant cross-border payments powered by Stellar blockchain technology",
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Send money to 180+ countries with competitive exchange rates",
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30"
    }
  ];

  const stats = [
    { value: "50M+", label: "Transactions", icon: TrendingUp },
    { value: "180+", label: "Countries", icon: Globe },
    { value: "99.99%", label: "Uptime", icon: Clock },
    { value: "4.9★", label: "Rating", icon: Star }
  ];

  const techStack = [
    { name: "Stellar", description: "Blockchain Network" },
    { name: "AI Security", description: "Fraud Detection" },
    { name: "256-bit", description: "Encryption" },
    { name: "ISO 27001", description: "Certified" }
  ];

  return (
    <div className="min-h-screen modern-gradient relative overflow-hidden">
      {/* Enhanced premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-modern-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-modern-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl animate-modern-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-modern-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Modern Header */}
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
              className="glass-card-hover text-white border-none px-6 py-3"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="premium-button animate-modern-glow"
            >
              Get Started Free
              <Sparkles className="ml-2 h-4 w-4" />
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
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">The Future of Finance is Here</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold text-gradient-modern mb-8 leading-tight">
            Send Money
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Anywhere, Instantly
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of global payments with blockchain technology. 
            Lower fees, faster transfers, and complete transparency.
          </p>
          
          {/* Technology Stack */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card p-3 text-center"
              >
                <div className="text-white font-semibold text-sm">{tech.name}</div>
                <div className="text-white/70 text-xs">{tech.description}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="premium-button text-lg px-12 py-6 animate-modern-glow"
            >
              Start Sending Money
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="glass-card-hover text-white border-white/20 px-12 py-6 text-lg"
            >
              <Lock className="mr-2 h-5 w-5" />
              View Live Demo
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card modern-shadow text-center metrics-card hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm font-medium">
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
          transition={{ delay: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Alprax Flow?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the most secure, fast, and affordable way to send money globally.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className={`glass-card modern-shadow h-full bg-gradient-to-br ${feature.gradient} border ${feature.border} group-hover:scale-105 transition-all duration-500`}>
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mb-24"
        >
          <Card className="glass-card modern-shadow-lg max-w-4xl mx-auto security-card">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl text-white/95 mb-8 font-medium leading-relaxed">
                "Alprax Flow transformed how I send money to my family. 
                What used to take 3-5 days now happens in seconds, with fees 90% lower than traditional banks."
              </blockquote>
              <div className="flex items-center justify-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">Sarah Chen</div>
                  <div className="text-white/70">Small Business Owner, Singapore</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center"
        >
          <Card className="glass-card modern-shadow-lg">
            <CardContent className="p-16">
              <TrendingUp className="h-20 w-20 mx-auto mb-8 text-blue-400" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Finances?
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join millions of users who trust Alprax Flow for their global money transfers. 
                Sign up today and get your first transfer with zero fees.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="premium-button text-xl px-16 py-8 animate-modern-glow"
              >
                Create Free Account
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <p className="text-white/60 text-sm mt-6">
                No hidden fees • Free to start • Instant verification
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
