
import { Loader2 } from "lucide-react";

interface QRCodeDisplayProps {
  isLoading: boolean;
  qrCodeUrl: string;
}

export const QRCodeDisplay = ({ isLoading, qrCodeUrl }: QRCodeDisplayProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {qrCodeUrl && (
        <div className="bg-white p-4 rounded-lg">
          <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
        </div>
      )}
    </div>
  );
};
