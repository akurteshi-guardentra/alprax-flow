
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const transactionVolumeData = [
  { month: 'Jan', volume: 150000, fees: 3000 },
  { month: 'Feb', volume: 220000, fees: 4400 },
  { month: 'Mar', volume: 280000, fees: 5600 },
  { month: 'Apr', volume: 380000, fees: 7600 },
  { month: 'May', volume: 460000, fees: 9200 },
  { month: 'Jun', volume: 580000, fees: 11600 },
];

export function TransactionVolumeChart() {
  return (
    <Card className="border-none bg-white/5">
      <CardHeader>
        <CardTitle className="text-lg text-white">Transaction Volume & Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transactionVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(0,0,0,0.8)", 
                  border: "none",
                  borderRadius: "8px",
                  color: "white"
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="volume" 
                stroke="#22c55e"
                strokeWidth={2}
                name="Transaction Volume"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="fees" 
                stroke="#eab308"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
