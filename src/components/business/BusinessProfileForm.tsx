
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import type { BusinessProfileFormData } from '@/types/business';
import { Building2, Briefcase } from 'lucide-react';

export function BusinessProfileForm() {
  const { createBusinessProfile, isCreating } = useBusinessProfile();
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    business_name: '',
    business_type: '',
    registration_number: '',
    industry: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBusinessProfile(formData);
  };

  return (
    <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-kosovo-yellow" />
          Business Profile Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_type">Business Type</Label>
            <Select
              value={formData.business_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="llc">LLC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_number">Registration Number (Optional)</Label>
            <Input
              id="registration_number"
              value={formData.registration_number}
              onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry (Optional)</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Business Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
