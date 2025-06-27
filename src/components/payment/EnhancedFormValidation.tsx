
import { AlertCircle, CheckCircle, Clock, DollarSign, Globe, User } from 'lucide-react';
import { FavoriteRecipient } from '@/types/favoriteRecipient';

interface ValidationItem {
  label: string;
  status: 'valid' | 'invalid' | 'pending';
  message: string;
  icon: React.ReactNode;
}

interface EnhancedFormValidationProps {
  recipient: FavoriteRecipient | null;
  amount: string;
  countryCode: string;
  xlmBalance: number;
  fiatBalance: number;
  currentRate: number;
  ratesLoading: boolean;
}

export function EnhancedFormValidation({
  recipient,
  amount,
  countryCode,
  xlmBalance,
  fiatBalance,
  currentRate,
  ratesLoading
}: EnhancedFormValidationProps) {
  
  const validations: ValidationItem[] = [
    {
      label: 'Recipient',
      status: recipient ? 
        (recipient.stellar_address?.startsWith('G') && recipient.stellar_address.length === 56 ? 'valid' : 'invalid') : 
        'invalid',
      message: !recipient ? 'Please select a recipient' : 
               !recipient.stellar_address?.startsWith('G') ? 'Invalid Stellar address format' :
               recipient.stellar_address.length !== 56 ? 'Stellar address must be 56 characters' :
               'Valid recipient selected',
      icon: <User className="w-3 h-3" />
    },
    {
      label: 'Country',
      status: countryCode || recipient?.country ? 'valid' : 'invalid',
      message: countryCode || recipient?.country ? 'Country selected' : 'Please select a country',
      icon: <Globe className="w-3 h-3" />
    },
    {
      label: 'Amount',
      status: amount && parseFloat(amount) > 0 && parseFloat(amount) <= fiatBalance ? 'valid' : 'invalid',
      message: !amount ? 'Please enter an amount' :
               parseFloat(amount) <= 0 ? 'Amount must be greater than 0' :
               parseFloat(amount) > fiatBalance ? 'Insufficient funds' :
               'Valid amount entered',
      icon: <DollarSign className="w-3 h-3" />
    },
    {
      label: 'XLM Balance',
      status: xlmBalance > 0 ? 'valid' : 'invalid',
      message: xlmBalance > 0 ? `${xlmBalance.toFixed(7)} XLM available` : 'Account needs funding with XLM',
      icon: <CheckCircle className="w-3 h-3" />
    },
    {
      label: 'Exchange Rates',
      status: ratesLoading ? 'pending' : (currentRate > 0 ? 'valid' : 'invalid'),
      message: ratesLoading ? 'Loading exchange rates...' : 
               currentRate > 0 ? 'Exchange rates loaded' : 'Exchange rates unavailable',
      icon: <Clock className="w-3 h-3" />
    }
  ];

  const allValid = validations.every(v => v.status === 'valid');
  const hasPending = validations.some(v => v.status === 'pending');

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-white mb-2">Form Status</div>
      
      <div className="space-y-2">
        {validations.map((validation, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
              validation.status === 'valid' ? 'bg-green-500/20 text-green-400' :
              validation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {validation.status === 'valid' ? <CheckCircle className="w-3 h-3" /> :
               validation.status === 'pending' ? <Clock className="w-3 h-3 animate-spin" /> :
               <AlertCircle className="w-3 h-3" />}
            </div>
            <span className="text-white/80">{validation.label}:</span>
            <span className={`${
              validation.status === 'valid' ? 'text-green-400' :
              validation.status === 'pending' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {validation.message}
            </span>
          </div>
        ))}
      </div>

      <div className={`p-2 rounded text-xs font-medium ${
        allValid ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
        hasPending ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
        'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}>
        {allValid ? '✓ Ready to send payment' :
         hasPending ? '⏳ Please wait...' :
         '⚠️ Please complete all required fields'}
      </div>
    </div>
  );
}
