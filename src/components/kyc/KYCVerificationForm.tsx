import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { DocumentType } from "@/hooks/useKYC";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { motion } from "framer-motion";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { useMobile } from "@/hooks/use-mobile";
import KYCDocumentUploader from "./KYCDocumentUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KYCVerificationFormProps {
  onSubmit?: (documentType: DocumentType, file: File, additionalInfo: Record<string, any>) => Promise<any>;
}

const KYCVerificationForm = ({ onSubmit }: KYCVerificationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  const { isMobile } = useMobile();
  const [activeTab, setActiveTab] = useState<string>("id");

  // Document type maps for different tabs
  const idDocuments: DocumentType[] = ['passport', 'id_card', 'drivers_license'];
  const proofOfAddressDocuments: DocumentType[] = ['utility_bill'];

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value as DocumentType);
  };

  const handleFileUpload = async (file: File) => {
    if (!documentType) {
      toast.error("Please select a document type first");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(
          documentType as DocumentType,
          file,
          { notes: additionalNotes, documentCategory: activeTab }
        );
        
        toast.success("Document uploaded successfully!");
        setDocumentType("");
        setAdditionalNotes("");
      } else {
        toast.error("Submission function not provided");
      }
    } catch (error: any) {
      console.error('Error submitting KYC verification:', error);
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition({ duration: 0.4 })}
    >
      <Card className="w-full max-w-lg mx-auto bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            KYC Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="id" 
            className="w-full" 
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 mb-4 bg-white/5">
              <TabsTrigger value="id" className="text-white data-[state=active]:bg-primary">
                Identity Document
              </TabsTrigger>
              <TabsTrigger value="address" className="text-white data-[state=active]:bg-primary">
                Proof of Address
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="id" className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">ID Document Type</label>
                <Select
                  value={documentType}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger className="bg-white/10 border-white/10 text-white">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="id_card">National ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white/90">Document Upload</label>
                  <span className="text-xs text-white/60">
                    {isDataSaverEnabled ? "Low-res" : "High-res"}
                  </span>
                </div>
                <KYCDocumentUploader 
                  documentType={documentType}
                  onUpload={handleFileUpload}
                  isUploading={isSubmitting}
                  maxSizeMB={isDataSaverEnabled ? 3 : 5}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Address Document Type</label>
                <Select
                  value={documentType}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger className="bg-white/10 border-white/10 text-white">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility_bill">Utility Bill</SelectItem>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    <SelectItem value="tax_document">Tax Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Document Upload</label>
                <KYCDocumentUploader 
                  documentType={documentType}
                  onUpload={handleFileUpload}
                  isUploading={isSubmitting}
                  maxSizeMB={isDataSaverEnabled ? 3 : 5}
                />
              </div>
            </TabsContent>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Additional Notes (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={isLowEndDevice ? 2 : 3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any additional information about your document"
                />
              </div>
            
              {!isLowEndDevice && (
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="text-sm text-white/80">
                      <p className="font-medium text-blue-300">Important Notice</p>
                      <p>Please ensure all documents are:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Clear and legible</li>
                        <li>Not expired</li>
                        <li>Complete (all corners visible)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KYCVerificationForm;
