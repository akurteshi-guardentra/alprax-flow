import { useEffect, useState } from "react";
import { Profile } from "@/types/profile";

interface ProfileCompletion {
  percentage: number;
  completed: string[];
  missing: string[];
}

export const useProfileCompletion = (profile: Profile | null): ProfileCompletion => {
  const [completion, setCompletion] = useState<ProfileCompletion>({
    percentage: 0,
    completed: [],
    missing: []
  });
  
  useEffect(() => {
    if (!profile) {
      setCompletion({
        percentage: 0,
        completed: [],
        missing: ['full_name', 'phone_number', 'country', 'preferred_language', 'avatar_url']
      });
      return;
    }
    
    const fields: { [key: string]: { value: any, label: string } } = {
      full_name: { value: profile.full_name, label: 'Full name' },
      phone_number: { value: profile.phone_number, label: 'Phone number' },
      country: { value: profile.country, label: 'Country' },
      preferred_language: { value: profile.preferred_language, label: 'Language' },
      avatar_url: { value: profile.avatar_url, label: 'Profile photo' },
    };
    
    const completed: string[] = [];
    const missing: string[] = [];
    
    // Determine which fields are completed
    for (const [key, field] of Object.entries(fields)) {
      if (field.value) {
        completed.push(field.label);
      } else {
        missing.push(field.label);
      }
    }
    
    // Calculate percentage
    const totalFields = Object.keys(fields).length;
    const percentage = Math.round((completed.length / totalFields) * 100);
    
    setCompletion({
      percentage,
      completed,
      missing
    });
  }, [profile]);
  
  return completion;
};
