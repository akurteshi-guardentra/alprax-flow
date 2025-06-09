
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
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
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Terms & Privacy</h1>
              <p className="text-white/80">Last updated: April 2024</p>
            </div>

            <Separator className="my-6 bg-white/20" />

            <div className="space-y-8 text-white/90">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Terms of Service</h2>
                <p className="mb-4">
                  By accessing and using this application, you agree to be bound by these terms and conditions.
                  The application provides financial services subject to applicable laws and regulations.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of the application
                  constitutes acceptance of modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Privacy Policy</h2>
                <p className="mb-4">
                  We are committed to protecting your privacy. This privacy policy explains how we collect,
                  use, and safeguard your personal information.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We collect information you provide directly to us</li>
                  <li>We use industry-standard security measures</li>
                  <li>We do not sell your personal information</li>
                  <li>You can request access to your data at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Data Collection</h2>
                <p>
                  We collect and process personal data in accordance with GDPR and other applicable
                  data protection laws. You have the right to access, correct, or delete your personal data.
                </p>
              </section>
            </div>

            <Separator className="my-6 bg-white/20" />

            <div className="text-center text-white/60 text-sm">
              <p>If you have any questions about these terms, please contact us.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
