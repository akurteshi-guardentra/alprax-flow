import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { SystemHealthDashboard } from "@/components/admin/SystemHealthDashboard";
import { useNavigate } from "react-router-dom";

const SystemHealth = () => {
  const navigate = useNavigate();

  return (
    <UnifiedLayout
      showBackButton
      onBack={() => navigate('/dashboard')}
      title="System Health"
      subtitle="Monitor system performance and health metrics"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <SystemHealthDashboard />
      </div>
    </UnifiedLayout>
  );
};

export default SystemHealth;