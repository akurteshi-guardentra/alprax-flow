
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTransactionAnalytics } from "@/hooks/useTransactionAnalytics";

const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

export function TransactionTypesChart() {
  const { transactionsByType, isLoading } = useTransactionAnalytics();
  
  // Format data for pie chart
  const chartData = Object.entries(transactionsByType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));
  
  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm h-80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Transaction Types</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-60px)]">
          <div className="animate-pulse bg-white/10 w-full h-full rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  if (!chartData.length) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm h-80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Transaction Types</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-60px)] text-white/60">
          No transaction data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Transaction Types</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "rgba(0,0,0,0.8)", 
                  border: "none",
                  borderRadius: "8px",
                  color: "white"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
