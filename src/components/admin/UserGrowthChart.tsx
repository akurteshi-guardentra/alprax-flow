
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const userGrowthData = [
  { month: 'Jan', users: 1200, premium: 200 },
  { month: 'Feb', users: 1900, premium: 350 },
  { month: 'Mar', users: 2400, premium: 480 },
  { month: 'Apr', users: 3100, premium: 720 },
  { month: 'May', users: 4200, premium: 980 },
  { month: 'Jun', users: 5800, premium: 1450 },
];

export function UserGrowthChart() {
  return (
    <Card className="border-none bg-white/5">
      <CardHeader>
        <CardTitle className="text-lg text-white">User Growth & Premium Adoption</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="premiumUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#userGrowth)"
                name="Total Users"
              />
              <Area 
                type="monotone" 
                dataKey="premium" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#premiumUsers)"
                name="Premium Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
