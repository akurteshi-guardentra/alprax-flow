
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Camera, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VerifyDocument = () => {
  const navigate = useNavigate();
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (event.target.files && event.target.files[0]) {
      setter(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!frontImage || !backImage || !selfieImage) {
      toast.error('Please upload all required images');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Upload images to storage
      const timestamp = Date.now();
      const frontPath = `${user.id}/documents/front_${timestamp}.jpg`;
      const backPath = `${user.id}/documents/back_${timestamp}.jpg`;
      const selfiePath = `${user.id}/documents/selfie_${timestamp}.jpg`;

      const [frontUpload, backUpload, selfieUpload] = await Promise.all([
        supabase.storage.from('kyc_documents').upload(frontPath, frontImage),
        supabase.storage.from('kyc_documents').upload(backPath, backImage),
        supabase.storage.from('kyc_documents').upload(selfiePath, selfieImage)
      ]);

      if (frontUpload.error || backUpload.error || selfieUpload.error) {
        throw new Error('Failed to upload images');
      }

      // Update verification attempt
      const { error: updateError } = await supabase
        .from('verification_attempts')
        .update({
          front_document_url: frontPath,
          back_document_url: backPath,
          selfie_url: selfiePath,
          status: 'submitted'
        })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      toast.success('Documents uploaded successfully');
      navigate('/verification/success');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] relative overflow-hidden">
      {/* Gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-2xl mx-auto relative px-4 py-8">
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
          className="mt-16 space-y-6"
        >
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-white">Upload your documents</h1>
            <p className="text-white/60 max-w-md mx-auto">
              Please provide clear photos of your ID document and a selfie
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="block">
                  <div className="group relative aspect-[3/2] rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-white/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFrontImage)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {frontImage ? (
                        <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-white/40 group-hover:text-white/60 mb-2" />
                      )}
                      <span className="text-sm text-white/60 text-center">
                        {frontImage ? 'Front side uploaded' : 'Upload front side'}
                      </span>
                    </div>
                  </div>
                </label>

                <label className="block">
                  <div className="group relative aspect-[3/2] rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-white/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setBackImage)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {backImage ? (
                        <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-white/40 group-hover:text-white/60 mb-2" />
                      )}
                      <span className="text-sm text-white/60 text-center">
                        {backImage ? 'Back side uploaded' : 'Upload back side'}
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block">
                  <div className="group relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-white/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setSelfieImage)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {selfieImage ? (
                        <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                      ) : (
                        <Camera className="w-8 h-8 text-white/40 group-hover:text-white/60 mb-2" />
                      )}
                      <span className="text-sm text-white/60 text-center">
                        {selfieImage ? 'Selfie uploaded' : 'Take a selfie'}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!frontImage || !backImage || !selfieImage || isUploading}
              className="w-full py-6 bg-white text-blue-900 hover:bg-white/90"
            >
              {isUploading ? 'Uploading...' : 'Submit documents'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyDocument;
