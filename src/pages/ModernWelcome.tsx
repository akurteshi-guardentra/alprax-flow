import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ModernHero } from "@/components/welcome/ModernHero";
import { ModernFeatures } from "@/components/welcome/ModernFeatures";
import { ModernTestimonials } from "@/components/welcome/ModernTestimonials";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useWelcomePerformance } from "@/hooks/use-welcome-performance";

const ModernWelcome = () => {
  const navigate = useNavigate();
  const { trackPageLoad, trackUserInteraction } = useWelcomePerformance();
  
  // Track page load metrics
  useEffect(() => {
    trackPageLoad();
    
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Clean up
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, [trackPageLoad]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <ModernHero />
      
      {/* Features Section */}
      <ModernFeatures />
      
      {/* Testimonials Section */}
      <ModernTestimonials />
      
      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Background design elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 dark:bg-secondary/10 blur-3xl" />
        </div>
        
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Ready to experience <span className="text-primary dark:text-primary-light">borderless</span> payments?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10"
            >
              Join thousands of customers who've already simplified their international money transfers.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => {
                  trackUserInteraction('cta_signup_click');
                  navigate('/signup');
                }}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 h-12 text-base"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  trackUserInteraction('learn_more_click');
                  document.getElementById('features')?.scrollIntoView();
                }}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-750 h-12 text-base"
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Features</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Security</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Documentation</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Help Center</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">API</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Privacy</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Terms</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Security</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Alprax Flow. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernWelcome;
