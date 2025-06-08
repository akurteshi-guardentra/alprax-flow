
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const userSegmentationData = [
  { name: 'Retail', value: 65 },
  { name: 'Institutional', value: 25 },
  { name: 'Business', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function UserSegmentationChart() {
  return (
    <Card className="border-none bg-white/5">
      <CardHeader>
        <CardTitle className="text-lg text-white">User Segmentation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userSegmentationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userSegmentationData.map((entry, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
