
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Phone, Book } from "lucide-react";
import { toast } from "sonner";

const Help = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Go to Settings > Security > Change Password to update your password."
    },
    {
      question: "How to make a transfer?",
      answer: "Click 'Send Money' from the dashboard, enter recipient details and amount."
    },
    {
      question: "What are the transaction limits?",
      answer: "Daily limit is $10,000. Monthly limit is $50,000 for verified accounts."
    },
    {
      question: "How to contact customer support?",
      answer: "Use the contact options below or email support@alpraxflow.com"
    }
  ];

  const handleContactSupport = (method: string) => {
    switch (method) {
      case 'chat':
        toast.info("Live chat will be available soon! For now, please email us.");
        break;
      case 'email':
        window.location.href = "mailto:support@alpraxflow.com";
        break;
      case 'phone':
        toast.info("Phone support: +1 (555) 123-4567 (Mon-Fri 9AM-6PM EST)");
        break;
    }
  };

  return (
    <div className="min-h-screen modern-gradient p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-0 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20"
        >
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 mx-auto text-white mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Help & Support</h1>
            <p className="text-white/80">How can we help you today?</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card modern-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Book className="h-5 w-5 text-blue-400" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-white font-medium">{item.question}</h3>
                      <p className="text-white/70 text-sm">{item.answer}</p>
                      {index < faqItems.length - 1 && (
                        <div className="border-b border-white/10 pt-2"></div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="glass-card modern-shadow">
                <CardHeader>
                  <CardTitle className="text-white">Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleContactSupport('email')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white h-auto py-4 flex items-center justify-start space-x-3"
                  >
                    <Mail className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-white/70">support@alpraxflow.com</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleContactSupport('chat')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white h-auto py-4 flex items-center justify-start space-x-3"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Live Chat</div>
                      <div className="text-sm text-white/70">Coming soon</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => handleContactSupport('phone')}
                    className="w-full bg-white/10 hover:bg-white/20 text-white h-auto py-4 flex items-center justify-start space-x-3"
                  >
                    <Phone className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-white/70">Mon-Fri 9AM-6PM EST</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card modern-shadow border-blue-500/25">
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-white font-medium">Need Immediate Help?</h3>
                    <p className="text-white/70 text-sm">
                      For urgent issues, please email us at support@alpraxflow.com 
                      with "URGENT" in the subject line.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
