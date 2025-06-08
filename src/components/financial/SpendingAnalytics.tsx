
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface Transaction {
  category: string;
  amount: number;
}

const categoryColors: Record<string, string> = {
  Dining: "bg-kosovo-blue",
  Travel: "bg-kosovo-yellow",
  Shopping: "bg-accent",
  Bills: "bg-primary",
  Entertainment: "bg-emerald-500",
  Others: "bg-purple-500"
};

export function SpendingAnalytics() {
  const { data: spendingCategories } = useQuery({
    queryKey: ['spending-categories'],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('type', 'expense')
        .returns<Transaction[]>();

      if (error) throw error;

      // Calculate totals and percentages
      const categoryTotals = (transactions || []).reduce((acc: Record<string, number>, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {});

      const total = Object.values(categoryTotals).reduce((a: number, b: number) => a + b, 0);

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount: amount as number,
        percentage: total > 0 ? Math.round(((amount as number) / total) * 100) : 0,
        color: categoryColors[category] || "bg-gray-500"
      }));
    }
  });

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-kosovo-blue/80 to-kosovo-blue/70 backdrop-blur-sm hover:from-kosovo-blue/85 hover:to-kosovo-blue/75 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center justify-center gap-2">
          <PieChart className="h-5 w-5 text-kosovo-yellow" />
          Spending Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {spendingCategories?.map((category) => (
          <div key={category.category} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{category.category}</span>
              <span className="text-kosovo-yellow font-medium">{category.percentage}%</span>
            </div>
            <Progress
              value={category.percentage}
              className={cn(`h-2 ${category.color}`)}
            />
            <div className="text-right">
              <span className="text-sm text-white/80">
                ${category.amount.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
