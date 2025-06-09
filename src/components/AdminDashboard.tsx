
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { MetricsGrid } from "./admin/MetricsGrid";
import { UserGrowthChart } from "./admin/UserGrowthChart";
import { TransactionVolumeChart } from "./admin/TransactionVolumeChart";
import { UserSegmentationChart } from "./admin/UserSegmentationChart";
import { SecurityOverview } from "./admin/SecurityOverview";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-kosovo-yellow" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsGrid />
          
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <UserGrowthChart />
            <TransactionVolumeChart />
            <UserSegmentationChart />
            <SecurityOverview />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
