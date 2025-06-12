
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, DollarSign, CreditCard, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Notifications = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-red-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back</span>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-20"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Bell className="h-12 w-12 mx-auto text-white mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-white/80">Stay updated with your account activity</p>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Recent Notifications</h2>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4">
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
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-white capitalize">{key}</p>
                        <p className="text-white/60 text-sm">
                          Receive notifications about {key}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <Separator className="my-6 bg-white/20" />

            <div className="text-center">
              <Button 
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 border-none"
              >
                <span>Mark all as read</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
