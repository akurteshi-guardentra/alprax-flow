
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile } from "@/types/profile";

interface FullNameFieldProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const FullNameField = ({ profile, setProfile }: FullNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-white">Full Name</Label>
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
        <Input 
          value={profile?.full_name || ''}
          onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
          placeholder="Enter your full name"
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />
      </div>
    </div>
  );
};
