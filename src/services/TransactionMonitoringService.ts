import { toast } from 'sonner';

export interface TransactionAlert {
  id: string;
  type: 'large_amount' | 'failed_transaction' | 'unusual_activity' | 'security_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  transactionId?: string;
  acknowledged: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  variant: 'default' | 'destructive' | 'outline';
}

export interface MonitoringRule {
  id: string;
  name: string;
  type: 'amount_threshold' | 'frequency_limit' | 'recipient_verification' | 'time_restriction';
  enabled: boolean;
  config: Record<string, any>;
}

export interface TransactionMonitoringData {
  recentTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  alerts: TransactionAlert[];
  securityScore: number;
}

class TransactionMonitoringService {
  private alerts: TransactionAlert[] = [];
  private monitoringRules: MonitoringRule[] = [
    {
      id: 'large-amount',
      name: 'Large Amount Alert',
      type: 'amount_threshold',
      enabled: true,
      config: { threshold: 1000, currency: 'XLM' }
    },
    {
      id: 'high-frequency',
      name: 'High Frequency Alert',
      type: 'frequency_limit',
      enabled: true,
      config: { maxTransactions: 10, timeWindow: 3600000 } // 10 transactions per hour
    },
    {
      id: 'new-recipient',
      name: 'New Recipient Verification',
      type: 'recipient_verification',
      enabled: true,
      config: { requireVerification: true }
    }
  ];

  async monitorTransaction(
    amount: number,
    recipient: string,
    userId: string
  ): Promise<TransactionAlert[]> {
    const alerts: TransactionAlert[] = [];

    for (const rule of this.monitoringRules) {
      if (!rule.enabled) continue;

      const alert = await this.checkRule(rule, { amount, recipient, userId });
      if (alert) {
        alerts.push(alert);
        this.alerts.push(alert);
      }
    }

    // Display high-severity alerts immediately
    alerts.forEach(alert => {
      if (alert.severity === 'high' || alert.severity === 'critical') {
        toast.warning(alert.title, {
          description: alert.message,
        });
      }
    });

    return alerts;
  }

  private async checkRule(
    rule: MonitoringRule,
    transaction: { amount: number; recipient: string; userId: string }
  ): Promise<TransactionAlert | null> {
    switch (rule.type) {
      case 'amount_threshold':
        return this.checkAmountThreshold(rule, transaction);
      
      case 'frequency_limit':
        return this.checkFrequencyLimit(rule, transaction);
      
      case 'recipient_verification':
        return this.checkRecipientVerification(rule, transaction);
      
      default:
        return null;
    }
  }

  private checkAmountThreshold(
    rule: MonitoringRule,
    transaction: { amount: number; recipient: string; userId: string }
  ): TransactionAlert | null {
    if (transaction.amount >= rule.config.threshold) {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'large_amount',
        severity: transaction.amount >= rule.config.threshold * 5 ? 'critical' : 'high',
        title: 'Large Amount Transaction',
        message: `Transaction amount (${transaction.amount} ${rule.config.currency}) exceeds threshold (${rule.config.threshold} ${rule.config.currency})`,
        timestamp: new Date(),
        acknowledged: false,
        actions: [
          { label: 'Proceed', action: 'proceed', variant: 'default' },
          { label: 'Cancel', action: 'cancel', variant: 'destructive' }
        ]
      };
    }
    return null;
  }

  private checkFrequencyLimit(
    rule: MonitoringRule,
    transaction: { amount: number; recipient: string; userId: string }
  ): TransactionAlert | null {
    // Mock frequency check - in production, check against actual transaction history
    const recentTransactions = Math.floor(Math.random() * 15); // Simulate recent transaction count
    
    if (recentTransactions >= rule.config.maxTransactions) {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'unusual_activity',
        severity: 'medium',
        title: 'High Transaction Frequency',
        message: `${recentTransactions} transactions in the last hour exceeds limit of ${rule.config.maxTransactions}`,
        timestamp: new Date(),
        acknowledged: false,
        actions: [
          { label: 'Continue', action: 'continue', variant: 'default' },
          { label: 'Review', action: 'review', variant: 'outline' }
        ]
      };
    }
    return null;
  }

  private checkRecipientVerification(
    rule: MonitoringRule,
    transaction: { amount: number; recipient: string; userId: string }
  ): TransactionAlert | null {
    // Mock recipient verification - in production, check against known recipients
    const isKnownRecipient = Math.random() > 0.3; // 70% chance of being known
    
    if (!isKnownRecipient && rule.config.requireVerification) {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'security_alert',
        severity: 'medium',
        title: 'New Recipient',
        message: 'Transaction to new/unverified recipient requires additional confirmation',
        timestamp: new Date(),
        acknowledged: false,
        actions: [
          { label: 'Verify & Send', action: 'verify', variant: 'default' },
          { label: 'Cancel', action: 'cancel', variant: 'destructive' }
        ]
      };
    }
    return null;
  }

  getAlerts(filter?: { severity?: string; acknowledged?: boolean }): TransactionAlert[] {
    let filteredAlerts = [...this.alerts];

    if (filter?.severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === filter.severity);
    }

    if (filter?.acknowledged !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === filter.acknowledged);
    }

    return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  getMonitoringRules(): MonitoringRule[] {
    return [...this.monitoringRules];
  }

  updateMonitoringRule(ruleId: string, updates: Partial<MonitoringRule>): boolean {
    const ruleIndex = this.monitoringRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.monitoringRules[ruleIndex] = { ...this.monitoringRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  getMonitoringData(): TransactionMonitoringData {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentAlerts = this.alerts.filter(a => now - a.timestamp.getTime() < oneHour);
    
    return {
      recentTransactions: Math.floor(Math.random() * 50) + 10, // Mock data
      failedTransactions: Math.floor(Math.random() * 5),
      totalVolume: Math.floor(Math.random() * 10000) + 1000,
      alerts: recentAlerts,
      securityScore: Math.max(0, 100 - (recentAlerts.length * 10))
    };
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

export const transactionMonitoringService = new TransactionMonitoringService();