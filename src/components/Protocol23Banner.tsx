import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

export function Protocol23Banner() {
  const [closed, setClosed] = useState(() => {
    return localStorage.getItem('protocol23-banner-closed') === 'true';
  });

  const handleClose = () => {
    localStorage.setItem('protocol23-banner-closed', 'true');
    setClosed(true);
  };

  if (closed) return null;

  return (
    <Alert className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-medium">
            <strong>Important:</strong> Stellar Testnet will reset on August 14th for Protocol 23 upgrade. 
            All test accounts and balances will be cleared.
          </span>
          <a 
            href="https://stellar.org/blog/developers/protocol-23-upgrade-guide" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Learn more <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 hover:bg-orange-500/20 ml-2"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}