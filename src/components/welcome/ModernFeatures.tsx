import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  BarChart4, 
  Shield, 
  Zap, 
  Globe, 
  Clock, 
  DollarSign, 
  ThumbsUp 
} from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const FeatureCard = ({ title, description, icon, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
  >
    <div className="mb-4 bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-lg flex items-center justify-center text-primary dark:text-primary-light">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

export const ModernFeatures = () => {
  const features = [
    {
      title: 'Global Transfers',
      description: 'Send money to over 180 countries with competitive exchange rates and low fees.',
      icon: <Globe className="h-6 w-6" />
    },
    {
      title: 'Real-time Tracking',
      description: 'Follow your money every step of the way with live status updates and notifications.',
      icon: <Clock className="h-6 w-6" />
    },
    {
      title: 'Secure Payments',
      description: 'Industry-leading security measures keep your money and information safe.',
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: 'Great Exchange Rates',
      description: 'Get competitive exchange rates without hidden fees for international transfers.',
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: 'Easy Management',
      description: 'Manage all your transactions, recipients, and templates in one place.',
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      title: 'Instant Transfers',
      description: 'Some transfers arrive in seconds, helping you send money when it matters most.',
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: 'Financial Insights',
      description: 'Track your spending patterns and get personalized financial insights.',
      icon: <BarChart4 className="h-6 w-6" />
    },
    {
      title: 'Customer Support',
      description: 'Our responsive support team is available to help you anytime you need assistance.',
      icon: <ThumbsUp className="h-6 w-6" />
    }
  ];
  
  return (
    <section className="bg-gray-50 dark:bg-gray-900/60 py-20 sm:py-28">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Designed for a <span className="text-primary dark:text-primary-light">Global</span> Experience
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Everything you need for seamless international money transfers in one elegant platform.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
