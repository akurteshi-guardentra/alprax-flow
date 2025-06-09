
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile } from "@/types/profile";

interface PhoneNumberFieldProps {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const PhoneNumberField = ({ profile, setProfile }: PhoneNumberFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-white">Phone Number</Label>
      <div className="relative">
        <Phone className="absolute left-3 top-3 h-4 w-4 text-white/60" />
        <Input 
          type="tel"
          value={profile?.phone_number || ''}
          onChange={(e) => setProfile({ ...profile!, phone_number: e.target.value })}
          placeholder="Enter your phone number"
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
        />
      </div>
    </div>
  );
};
