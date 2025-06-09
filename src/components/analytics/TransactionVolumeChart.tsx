
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTransactionAnalytics } from "@/hooks/useTransactionAnalytics";

export function TransactionVolumeChart() {
  const { transactionsByMonth, isLoading } = useTransactionAnalytics();
  
  if (isLoading) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm h-80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-60px)]">
          <div className="animate-pulse bg-white/10 w-full h-full rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  if (!transactionsByMonth.length) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm h-80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Transaction Volume</CardTitle>
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
        <CardTitle className="text-lg text-white">Transaction Volume</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(0,0,0,0.8)", 
                  border: "none",
                  borderRadius: "8px",
                  color: "white"
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
