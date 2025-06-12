
import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

export function TestnetBanner() {
  const [closed, setClosed] = useState(() => {
    // Check if the banner has been previously closed
    return localStorage.getItem('demo-banner-closed') === 'true';
  });

  const handleClose = () => {
    localStorage.setItem('demo-banner-closed', 'true');
    setClosed(true);
  };

  // Don't render if closed
  if (closed) return null;

  return (
    <div className="bg-blue-950 text-white p-2 flex items-center justify-between text-sm font-medium relative z-50">
      <div className="flex items-center mx-auto">
        <AlertCircle className="h-4 w-4 mr-2 text-blue-300" />
        <span>
          You are using <strong className="text-blue-300">Demo Mode</strong>. 
          All transactions are simulated for demonstration purposes.
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0 hover:bg-blue-900 text-blue-300"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
