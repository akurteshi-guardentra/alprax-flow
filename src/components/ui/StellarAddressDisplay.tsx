/**
 * Enhanced Stellar address display component
 * Provides multiple display modes and user-friendly representations
 */

import React, { useState } from 'react';
import { Copy, QrCode, Eye, EyeOff, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  formatStellarAddress, 
  generateMemorableName, 
  isValidStellarAddress,
  getAddressColor,
  formatBalance
} from '@/utils/stellar-display';
import { COPY } from '@/lib/constants/copy';

interface StellarAddressDisplayProps {
  address: string;
  name?: string;
  balance?: string | number;
  mode: 'compact' | 'standard' | 'full' | 'memorable' | 'card';
  showCopyButton?: boolean;
  showQRCode?: boolean;
  showBalance?: boolean;
  showNetworkBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export function StellarAddressDisplay({
  address,
  name,
  balance,
  mode = 'standard',
  showCopyButton = true,
  showQRCode = false,
  showBalance = false,
  showNetworkBadge = false,
  className = '',
  onClick
}: StellarAddressDisplayProps) {
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  if (!isValidStellarAddress(address)) {
    return (
      <div className={`flex items-center gap-2 text-destructive ${className}`}>
        <span className="text-sm">Invalid Stellar address</span>
      </div>
    );
  }

  const formatInfo = formatStellarAddress(address, { context: mode });
  const memorableName = generateMemorableName(address);
  const addressColors = getAddressColor(address);
  
  const displayName = name || (mode === 'memorable' ? memorableName : null);
  const displayAddress = showFullAddress ? address : formatInfo.display;

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      toast.success(COPY.WALLET.ADDRESS_COPIED);
    } catch (error) {
      console.warn('Failed to copy address:', error);
      toast.error('Failed to copy address');
    }
  };

  const toggleAddressVisibility = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowFullAddress(!showFullAddress);
  };

  // Card mode - full featured display
  if (mode === 'card') {
    return (
      <Card className={`p-4 space-y-3 ${className}`} onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addressColors.bg} ${addressColors.border} border`}>
              <User className={`w-5 h-5 ${addressColors.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              {displayName && (
                <h3 className="font-semibold text-foreground truncate">
                  {displayName}
                </h3>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                  {displayAddress}
                </code>
                {displayName !== memorableName && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs">
                          {memorableName}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Memorable name for this address</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showBalance && balance !== undefined && (
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatBalance(balance)}
                </p>
              </div>
            )}
            
            {showNetworkBadge && (
              <Badge variant="outline" className="text-xs">
                Testnet
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs"
            >
              <Copy className="w-3 h-3" />
              {COPY.WALLET.COPY_ADDRESS}
            </Button>
          )}
          
          {showQRCode && (
            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-xs"
                >
                  <QrCode className="w-3 h-3" />
                  QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Stellar Address QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this code to get the Stellar address
                  </p>
                  <code className="text-xs bg-muted p-2 rounded break-all">
                    {address}
                  </code>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleAddressVisibility}
            className="flex items-center gap-2 text-xs"
          >
            {showFullAddress ? (
              <>
                <EyeOff className="w-3 h-3" />
                Hide Full
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Show Full
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  // Inline modes
  return (
    <div className={`flex items-center gap-2 ${className}`} onClick={onClick}>
      {/* Address display */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {displayName && mode !== 'compact' && (
          <span className="font-medium text-foreground truncate">
            {displayName}
          </span>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <code className={`
                stellar-address font-mono text-sm px-2 py-1 rounded 
                ${mode === 'compact' ? 'text-xs' : ''}
                ${onClick ? 'cursor-pointer hover:bg-muted/80' : ''}
                bg-muted
              `}>
                {displayAddress}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{memorableName}</p>
                <p className="text-xs font-mono break-all max-w-xs">{address}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showBalance && balance !== undefined && (
          <span className="text-sm font-semibold text-foreground ml-2">
            {formatBalance(balance)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {showCopyButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className={`p-1 h-auto ${mode === 'compact' ? 'w-6 h-6' : 'w-8 h-8'}`}
                >
                  <Copy className={mode === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{COPY.WALLET.COPY_ADDRESS}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {showQRCode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 h-auto ${mode === 'compact' ? 'w-6 h-6' : 'w-8 h-8'}`}
                    >
                      <QrCode className={mode === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-400" />
                      </div>
                      <code className="text-xs bg-muted p-2 rounded break-all">
                        {address}
                      </code>
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show QR Code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {mode !== 'compact' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAddressVisibility}
                  className="p-1 h-auto w-8 h-8"
                >
                  {showFullAddress ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showFullAddress ? 'Hide full address' : 'Show full address'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function CompactStellarAddress({ address, ...props }: Omit<StellarAddressDisplayProps, 'mode'>) {
  return <StellarAddressDisplay address={address} mode="compact" {...props} />;
}

export function MemorableStellarAddress({ address, ...props }: Omit<StellarAddressDisplayProps, 'mode'>) {
  return <StellarAddressDisplay address={address} mode="memorable" {...props} />;
}

export function StellarAddressCard({ address, ...props }: Omit<StellarAddressDisplayProps, 'mode'>) {
  return <StellarAddressDisplay address={address} mode="card" {...props} />;
}