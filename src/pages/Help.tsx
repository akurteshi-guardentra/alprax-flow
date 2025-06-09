
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Mail, MessageCircle } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-red-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-16 w-16 mx-auto text-white mb-4" />
              <h1 className="text-3xl font-bold text-white mb-4">Help & Support</h1>
              <p className="text-white/80">How can we help you today?</p>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Common Questions</h2>
                <div className="space-y-4">
                  {[
                    "How do I reset my password?",
                    "How to make a transfer?",
                    "What are the transaction limits?",
                    "How to contact customer support?"
                  ].map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left text-white hover:bg-white/10"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Button
                  className="bg-white/10 hover:bg-white/20 text-white h-auto py-6 flex flex-col items-center space-y-2"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span>Live Chat</span>
                </Button>
                <Button
                  className="bg-white/10 hover:bg-white/20 text-white h-auto py-6 flex flex-col items-center space-y-2"
                >
                  <Mail className="h-6 w-6" />
                  <span>Email Support</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
