import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ModernHero = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900">
      {/* Background gradient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] rounded-full bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-[400px] -left-[400px] w-[800px] h-[800px] rounded-full bg-gradient-to-t from-secondary/20 to-transparent blur-3xl" />
      </div>
      
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 py-16 sm:py-24 lg:py-32 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-3 py-1.5 mb-6 text-xs font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
            >
              <span className="flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Simplified Global Money Transfers
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
            >
              Send Money <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Without Borders</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Fast, secure, and low-cost international transfers with real-time tracking and best-in-class exchange rates.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 h-12 text-base"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-750 h-12 text-base"
              >
                Log In
              </Button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mt-12"
            >
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Bank-level security</span>
              </div>
              
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Lightning-fast transfers</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right column - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-72 h-[580px] sm:w-80 sm:h-[640px]">
              {/* Phone frame */}
              <div className="absolute inset-0 rounded-[3rem] border-8 border-gray-900 dark:border-gray-800 bg-gray-800 shadow-lg overflow-hidden">
                {/* App screenshot */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
                  {/* Mock UI elements */}
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-24 h-5 bg-gray-700 rounded-md"></div>
                      <div className="flex space-x-2">
                        <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Balance card */}
                    <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-5 mb-6">
                      <div className="w-20 h-3 bg-white/20 rounded-md mb-2"></div>
                      <div className="w-32 h-6 bg-white/30 rounded-md mb-4"></div>
                      <div className="flex justify-between">
                        <div className="w-24 h-4 bg-white/20 rounded-md"></div>
                        <div className="w-16 h-4 bg-white/20 rounded-md"></div>
                      </div>
                    </div>
                    
                    {/* Transaction list */}
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div>
                              <div>
                                <div className="w-20 h-3 bg-gray-600 rounded-md mb-2"></div>
                                <div className="w-16 h-2.5 bg-gray-600/60 rounded-md"></div>
                              </div>
                            </div>
                            <div className="w-16 h-3 bg-gray-600 rounded-md"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Status bar */}
                <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-t-[calc(3rem-8px)] flex items-center justify-center">
                  <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
                </div>
                
                {/* Home indicator */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center">
                  <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg rounded-[3rem]"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
