
import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { Button } from './ui/button';

export function TestnetBanner() {
  const [closed, setClosed] = useState(() => {
    return localStorage.getItem('testnet-banner-closed') === 'true';
  });

  const handleClose = () => {
    localStorage.setItem('testnet-banner-closed', 'true');
    setClosed(true);
  };

  if (closed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 flex items-center justify-between text-sm font-medium relative z-50">
      <div className="flex items-center mx-auto">
        <Zap className="h-4 w-4 mr-2 text-blue-200" />
        <span>
          Running on <strong className="text-blue-200">Stellar Testnet</strong> - 
          Experience instant, free blockchain transactions
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0 hover:bg-white/20 text-blue-200"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
