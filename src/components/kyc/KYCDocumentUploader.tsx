import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, Check, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataSaverMode } from "@/hooks/use-data-saver";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { DocumentType } from "@/hooks/useKYC";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNetworkConditions } from "@/hooks/use-network-conditions";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";

interface KYCDocumentUploaderProps {
  documentType: DocumentType | "";
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  maxSizeMB?: number;
  className?: string;
}

export const KYCDocumentUploader = ({
  documentType,
  onUpload,
  isUploading,
  maxSizeMB = 5,
  className
}: KYCDocumentUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const { isDataSaverEnabled, isLowEndDevice } = useDataSaverMode();
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { connectionQuality } = useNetworkConditions();
  const { isLoading } = useNetworkAwareLoading(isUploading);

  // Adjust max file size based on data saver mode and network conditions
  const adjustedMaxSize = isDataSaverEnabled || connectionQuality === 'poor' ? 
    Math.min(2, maxSizeMB) : maxSizeMB;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file size
    if (file.size > adjustedMaxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${adjustedMaxSize}MB`);
      return false;
    }

    // Validate file type
    if (!file.type.match('image/(jpeg|jpg|png|gif|heic|heif)|application/pdf')) {
      toast.error("Only images (JPEG, PNG, GIF, HEIC) and PDF formats are supported");
      return false;
    }
    
    setSelectedFile(file);

    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        setSelectedFile(null);
        setPreviewUrl(null);
      } catch (error) {
        console.error("Error uploading document:", error);
      }
    }
  };

  const getDocumentTypeLabel = (type: DocumentType | "") => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'drivers_license': return 'Driver\'s License';
      case 'id_card': return 'National ID';
      case 'utility_bill': return 'Utility Bill';
      default: return 'Document';
    }
  };

  return (
    <motion.div
      className={cn(
        "rounded-lg overflow-hidden",
        className
      )}
      initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition({ duration: 0.3 })}
    >
      {!selectedFile ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all p-4",
            isDragActive ? "border-primary/50 bg-primary/5" : "border-white/20 hover:border-white/30 hover:bg-white/5",
            isLowEndDevice ? "h-28" : "h-36"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.heic,.heif"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          <Upload 
            className={cn(
              "mb-3 text-white/60",
              isLowEndDevice ? "w-6 h-6" : "w-8 h-8"
            )}
          />

          <p className="mb-2 text-sm text-center text-white/80">
            {documentType 
              ? `Upload your ${getDocumentTypeLabel(documentType as DocumentType)}`
              : "Click to upload or drag and drop"
            }
          </p>
          <p className="text-xs text-center text-white/60">
            Supported formats: PDF, JPG, PNG{!isDataSaverEnabled && ", HEIC"} (Max {adjustedMaxSize}MB)
          </p>
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg p-4 bg-white/5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              {previewUrl ? (
                <Image className="h-5 w-5 text-blue-400 mr-2" />
              ) : (
                <FileText className="h-5 w-5 text-blue-400 mr-2" />
              )}
              <span className="text-sm font-medium text-white/90 truncate max-w-[200px]">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-white/60 hover:text-white/90"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {previewUrl && (
            <div className="mb-3 rounded overflow-hidden max-h-[200px] flex justify-center bg-black/20">
              <img 
                src={previewUrl} 
                alt="Document preview" 
                className="max-h-[200px] object-contain"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className={cn(
                "text-white bg-primary hover:bg-primary/90 flex items-center gap-2",
                isLowEndDevice ? "h-9 text-xs" : ""
              )}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KYCDocumentUploader;
