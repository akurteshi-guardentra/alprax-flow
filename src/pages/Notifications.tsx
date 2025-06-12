
import { motion } from "framer-motion";
import { Bell, DollarSign, CreditCard, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    payments: true,
    security: true,
    promotions: false,
    updates: true
  });

  const notifications = [
    {
      id: 1,
      title: "Payment Received",
      message: "You received a payment of $250.00 from John Doe",
      time: "2 hours ago",
      icon: <DollarSign className="h-5 w-5 text-green-400" />
    },
    {
      id: 2,
      title: "Security Alert",
      message: "New login detected from Chrome on Windows",
      time: "5 hours ago",
      icon: <Settings className="h-5 w-5 text-yellow-400" />
    },
    {
      id: 3,
      title: "Card Update",
      message: "Your card ending in 4242 will expire soon",
      time: "1 day ago",
      icon: <CreditCard className="h-5 w-5 text-blue-400" />
    }
  ];

  return (
    <UnifiedLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-400" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="bg-white/10 rounded-full p-2">
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{notification.title}</h3>
                    <p className="text-white/70 text-sm">{notification.message}</p>
                    <p className="text-white/50 text-xs mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium capitalize">{key}</p>
                    <p className="text-white/60 text-sm">
                      Receive notifications about {key.toLowerCase()}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-white/20"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center">
          <Button 
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Mark all as read
          </Button>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default Notifications;
