
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageCircle, Book, Phone, Clock } from "lucide-react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Help = () => {
  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Go to the login page and click 'Forgot password'. Enter your email and follow the instructions."
    },
    {
      question: "How to make a transfer?",
      answer: "Click 'Send Money', select a recipient, enter the amount, and confirm the transaction."
    },
    {
      question: "What are the transaction limits?",
      answer: "On testnet, there are no limits. In production, limits depend on your verification level."
    },
    {
      question: "How to contact customer support?",
      answer: "Use the live chat below or send an email to support@alpraxflow.com"
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: () => console.log("Opening live chat..."),
      available: true
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      action: () => window.open("mailto:support@alpraxflow.com"),
      available: true
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for urgent issues",
      action: () => console.log("Showing phone number..."),
      available: false
    },
    {
      icon: Book,
      title: "Knowledge Base",
      description: "Browse our comprehensive guides",
      action: () => console.log("Opening knowledge base..."),
      available: true
    }
  ];

  return (
    <UnifiedLayout title="Help & Support">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Quick Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-white text-xl">How can we help you today?</CardTitle>
              <p className="text-white/70">Choose from the options below or browse our FAQ</p>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportOptions.map((option, index) => (
                  <Button
                    key={index}
                    onClick={option.action}
                    disabled={!option.available}
                    className="h-auto p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-left flex flex-col items-start space-y-2 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <option.icon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{option.title}</h3>
                        {!option.available && (
                          <span className="text-orange-400 text-xs">Coming Soon</span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/60 text-sm">{option.description}</p>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white font-medium mb-2">{item.question}</h3>
                  <p className="text-white/70 text-sm">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <h3 className="text-white font-medium">Support Hours</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/70">Live Chat & Email:</p>
                  <p className="text-white">24/7 Available</p>
                </div>
                <div>
                  <p className="text-white/70">Phone Support:</p>
                  <p className="text-white">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Help;
