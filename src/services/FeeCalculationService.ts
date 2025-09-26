import { stellar } from '@/lib/stellar';

export interface FeeCalculation {
  baseFee: number;
  networkFee: number;
  priorityFee: number;
  totalFee: number;
  estimatedConfirmationTime: string;
  feeLevel: 'low' | 'medium' | 'high';
}

export interface NetworkConditions {
  avgBaseFee: number;
  networkLoad: number;
  recentTransactionCount: number;
  recommendedFee: number;
}

class FeeCalculationService {
  private networkConditionsCache: { data: NetworkConditions; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  async calculateOptimalFee(
    amount: number,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<FeeCalculation> {
    try {
      const conditions = await this.getNetworkConditions();
      const baseFee = conditions.avgBaseFee;
      
      const multipliers = {
        low: 1.0,
        medium: 1.5,
        high: 2.5
      };

      const networkFee = baseFee * multipliers[priority];
      const priorityFee = this.calculatePriorityFee(amount, priority, conditions.networkLoad);
      const totalFee = baseFee + networkFee + priorityFee;

      const estimationTimes = {
        low: '5-10 minutes',
        medium: '2-5 minutes',
        high: '30 seconds - 2 minutes'
      };

      return {
        baseFee,
        networkFee,
        priorityFee,
        totalFee,
        estimatedConfirmationTime: estimationTimes[priority],
        feeLevel: priority
      };
    } catch (error) {
      console.error('Fee calculation failed:', error);
      
      // Fallback to conservative fee
      const fallbackFee = 0.00001; // 100 stroops
      return {
        baseFee: fallbackFee,
        networkFee: fallbackFee,
        priorityFee: 0,
        totalFee: fallbackFee * 2,
        estimatedConfirmationTime: '5-10 minutes',
        feeLevel: priority
      };
    }
  }

  private async getNetworkConditions(): Promise<NetworkConditions> {
    if (
      this.networkConditionsCache &&
      Date.now() - this.networkConditionsCache.timestamp < this.CACHE_DURATION
    ) {
      return this.networkConditionsCache.data;
    }

    try {
      // Mock network conditions - in production, fetch from Stellar network
      const conditions: NetworkConditions = {
        avgBaseFee: 0.00001, // 100 stroops
        networkLoad: Math.random() * 100, // 0-100%
        recentTransactionCount: Math.floor(Math.random() * 1000) + 500,
        recommendedFee: 0.00001
      };

      this.networkConditionsCache = {
        data: conditions,
        timestamp: Date.now()
      };

      return conditions;
    } catch (error) {
      console.error('Failed to fetch network conditions:', error);
      
      // Return default conditions
      return {
        avgBaseFee: 0.00001,
        networkLoad: 50,
        recentTransactionCount: 500,
        recommendedFee: 0.00001
      };
    }
  }

  private calculatePriorityFee(
    amount: number,
    priority: 'low' | 'medium' | 'high',
    networkLoad: number
  ): number {
    if (priority === 'low') return 0;
    
    // Higher network load = higher priority fee
    const loadMultiplier = networkLoad / 100;
    
    // Larger amounts get slightly higher priority fees for security
    const amountMultiplier = Math.min(amount / 1000, 0.1);
    
    const basePriorityFee = 0.000005; // 5 stroops
    
    const priorityMultipliers = {
      low: 0,
      medium: 1,
      high: 3
    };

    return basePriorityFee * priorityMultipliers[priority] * (1 + loadMultiplier + amountMultiplier);
  }

  async getFeeEstimatesForAmounts(amounts: number[]): Promise<Record<number, FeeCalculation[]>> {
    const estimates: Record<number, FeeCalculation[]> = {};
    
    await Promise.all(
      amounts.map(async (amount) => {
        const [low, medium, high] = await Promise.all([
          this.calculateOptimalFee(amount, 'low'),
          this.calculateOptimalFee(amount, 'medium'),
          this.calculateOptimalFee(amount, 'high')
        ]);
        
        estimates[amount] = [low, medium, high];
      })
    );

    return estimates;
  }

  async getRecommendedFeeLevel(amount: number): Promise<'low' | 'medium' | 'high'> {
    const conditions = await this.getNetworkConditions();
    
    // Recommend higher fees during high network load
    if (conditions.networkLoad > 80) return 'high';
    if (conditions.networkLoad > 50) return 'medium';
    
    // For large amounts, recommend at least medium priority
    if (amount > 1000) return 'medium';
    
    return 'low';
  }
}

export const feeCalculationService = new FeeCalculationService();