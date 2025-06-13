
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SimpleFundingModal } from './SimpleFundingModal';

interface CleanFundButtonProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function CleanFundButton({ variant = 'default', className }: CleanFundButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (variant === 'compact') {
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          size="sm"
          className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white ${className}`}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Funds
        </Button>
        <SimpleFundingModal open={showModal} onOpenChange={setShowModal} />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white ${className}`}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Funds
      </Button>
      <SimpleFundingModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}
