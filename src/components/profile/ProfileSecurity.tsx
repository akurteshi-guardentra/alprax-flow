import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ProfileSecurity() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Password update error:', error);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Security Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="text-white flex items-center gap-2">
              <Key className="h-4 w-4" />
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>

          <div>
            <Label htmlFor="new-password" className="text-white flex items-center gap-2">
              <Lock className="h-4 w-4" />
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="text-white flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">KYC Verification</h4>
          <p className="text-white/70 text-sm">
            Complete KYC verification to unlock higher transaction limits and additional features.
          </p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Start Verification
          </Button>
        </div>
      </Card>
    </div>
  );
}
