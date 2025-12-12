'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer';
  testMode?: boolean;
}

export function PaymentStatusBadge({ status, paymentMethod, testMode }: PaymentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: testMode ? 'Test - Paid' : 'Paid'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          text: 'Failed'
        };
      case 'refunded':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: CreditCard,
          text: 'Refunded'
        };
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          text: 'Pending'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
      {paymentMethod === 'credit_card' && (
        <Badge variant="outline" className="text-xs">
          PayTR
        </Badge>
      )}
      {testMode && (
        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
          Test
        </Badge>
      )}
    </div>
  );
}
