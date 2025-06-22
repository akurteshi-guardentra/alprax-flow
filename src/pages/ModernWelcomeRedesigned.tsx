
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, Globe, Star, Users, TrendingUp, Sparkles } from "lucide-react";

const ModernWelcomeRedesigned = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Advanced encryption and multi-signature protocols protect your transactions",
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Send money across borders in seconds with blockchain technology",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with 180+ countries at competitive exchange rates",
    }
  ];

  const stats = [
    { value: "2M+", label: "Happy Customers" },
    { value: "180+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
    { value: "$50B+", label: "Transferred" }
  ];

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Navigation */}
      <nav className="container mx-auto py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-h3 font-bold">Alprax Flow</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="btn-ghost"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto section-padding text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="stack-lg max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-small font-medium">
            <Sparkles className="w-4 h-4" />
            Trusted by millions worldwide
          </div>
          
          <h1 className="text-display">
            Send Money
            <br />
            <span className="text-brand">Anywhere, Instantly</span>
          </h1>
          
          <p className="text-body-large text-secondary max-w-2xl mx-auto">
            Experience the future of international money transfers with blockchain technology. 
            Lower fees, faster transfers, and complete transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')}
              className="premium-button text-lg px-8 py-4 h-12"
            >
              Start Sending Money
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-lg px-8 py-4 h-12"
            >
              View Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-secondary text-small">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 mb-4">Why Choose Alprax Flow?</h2>
            <p className="text-body-large text-secondary max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the most secure, 
              fast, and affordable way to send money globally.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className="modern-card text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-h3 mb-4">{feature.title}</h3>
                <p className="text-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="modern-card max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-warning fill-current" />
            ))}
          </div>
          <blockquote className="text-h3 font-normal mb-8 text-secondary">
            "Alprax Flow transformed how I send money to my family. 
            What used to take days now happens in seconds."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Sarah Chen</div>
              <div className="text-secondary text-small">Small Business Owner</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-tertiary py-20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="stack-lg max-w-3xl mx-auto"
          >
            <TrendingUp className="w-16 h-16 mx-auto text-primary" />
            <h2 className="text-h2">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-body-large text-secondary">
              Join millions of users who trust Alprax Flow for their global money transfers. 
              Sign up today and get your first transfer with zero fees.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="premium-button text-lg px-8 py-4 h-12 mx-auto"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-tertiary text-small">
              No hidden fees • Free to start • Instant verification
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="stack-sm">
                <a href="#" className="text-secondary hover:text-primary">Features</a>
                <a href="#" className="text-secondary hover:text-primary">Pricing</a>
                <a href="#" className="text-secondary hover:text-primary">Security</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="stack-sm">
                <a href="#" className="text-secondary hover:text-primary">About</a>
                <a href="#" className="text-secondary hover:text-primary">Careers</a>
                <a href="#" className="text-secondary hover:text-primary">Blog</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="stack-sm">
                <a href="#" className="text-secondary hover:text-primary">Documentation</a>
                <a href="#" className="text-secondary hover:text-primary">Help Center</a>
                <a href="#" className="text-secondary hover:text-primary">API</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="stack-sm">
                <a href="#" className="text-secondary hover:text-primary">Privacy</a>
                <a href="#" className="text-secondary hover:text-primary">Terms</a>
                <a href="#" className="text-secondary hover:text-primary">Security</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border-light pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-tertiary text-small">
              © {new Date().getFullYear()} Alprax Flow. All rights reserved.
            </p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-small font-medium">Alprax Flow</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernWelcomeRedesigned;
