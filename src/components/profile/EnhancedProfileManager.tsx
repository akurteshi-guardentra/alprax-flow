import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCopy } from '@/lib/constants/copy';
import { 
  User, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Edit, 
  Save, 
  X,
  Star,
  Award,
  Clock,
  Download,
  Upload,
  Share,
  Users,
  Building
} from 'lucide-react';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  country: string;
  verificationLevel: 'unverified' | 'basic' | 'enhanced' | 'premium';
  completionPercentage: number;
  createdAt: string;
  lastLogin: string;
}

interface VerificationStep {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'rejected';
  required: boolean;
  description: string;
}

export function EnhancedProfileManager() {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    country: 'US',
    verificationLevel: 'basic',
    completionPercentage: 75,
    createdAt: '2024-01-15',
    lastLogin: '2024-01-25'
  });

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'email',
      name: 'Email Verification',
      status: 'completed',
      required: true,
      description: 'Verify your email address to receive important updates'
    },
    {
      id: 'phone',
      name: 'Phone Verification',
      status: 'completed',
      required: true,
      description: 'Add an extra layer of security with SMS verification'
    },
    {
      id: 'identity',
      name: 'Identity Verification',
      status: 'pending',
      required: false,
      description: 'Upload government ID for enhanced security features'
    },
    {
      id: 'address',
      name: 'Address Verification',
      status: 'pending',
      required: false,
      description: 'Verify your address with a utility bill or bank statement'
    },
    {
      id: 'biometric',
      name: 'Biometric Verification',
      status: 'pending',
      required: false,
      description: 'Add facial recognition for maximum security'
    }
  ]);

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'unverified':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'basic':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'enhanced':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'premium':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getVerificationLevelIcon = (level: string) => {
    switch (level) {
      case 'unverified':
        return <AlertTriangle className="h-4 w-4" />;
      case 'basic':
        return <Shield className="h-4 w-4" />;
      case 'enhanced':
        return <CheckCircle className="h-4 w-4" />;
      case 'premium':
        return <Award className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
  const totalSteps = verificationSteps.length;

  const handleSaveProfile = () => {
    // In real app, save to backend
    setIsEditing(false);
    console.log('Saving profile:', profileData);
  };

  const handleStartVerification = (stepId: string) => {
    // In real app, start verification process
    console.log('Starting verification for step:', stepId);
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Header */}
      <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Management</span>
            </CardTitle>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "secondary" : "outline"}
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {profileData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold">{profileData.fullName}</h3>
                <Badge className={getVerificationLevelColor(profileData.verificationLevel)}>
                  {getVerificationLevelIcon(profileData.verificationLevel)}
                  <span className="ml-1 capitalize">{profileData.verificationLevel}</span>
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Profile Completion</span>
                  <span>{profileData.completionPercentage}%</span>
                </div>
                <Progress value={profileData.completionPercentage} className="h-2" />
              </div>
              
              <div className="text-sm text-muted-foreground">
                Member since {new Date(profileData.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    className="mobile-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="mobile-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!isEditing}
                    className="mobile-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profileData.country}
                    onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                    disabled={!isEditing}
                    className="mobile-input"
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button onClick={handleSaveProfile} className="mobile-button-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-foreground">247</div>
                  <div className="text-xs text-muted-foreground">Total Transactions</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">99.6%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">12</div>
                  <div className="text-xs text-muted-foreground">Favorite Recipients</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">4.9</div>
                  <div className="text-xs text-muted-foreground">User Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Verification Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-2">
                  {completedSteps}/{totalSteps}
                </div>
                <div className="text-sm text-muted-foreground">
                  Verification steps completed
                </div>
                <Progress value={(completedSteps / totalSteps) * 100} className="mt-2" />
              </div>
              
              <div className="space-y-3">
                {verificationSteps.map((step) => (
                  <div key={step.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{step.name}</div>
                        {step.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Badge className={getStepStatusColor(step.status)}>
                        {step.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {step.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                        {step.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {step.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </div>
                    {step.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartVerification(step.id)}
                        className="w-full mobile-button-primary"
                      >
                        Start Verification
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-700">
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Login Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified of new device logins
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-700">
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">Biometric Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Use fingerprint or face recognition
                    </div>
                  </div>
                  <Badge className="bg-gray-500/20 text-gray-700">
                    Disabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-base">Profile Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 flex flex-col">
                  <Download className="h-5 w-5 mb-1" />
                  <span className="text-sm">Export Profile</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col">
                  <Upload className="h-5 w-5 mb-1" />
                  <span className="text-sm">Import Data</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col">
                  <Share className="h-5 w-5 mb-1" />
                  <span className="text-sm">Share Profile</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col">
                  <Users className="h-5 w-5 mb-1" />
                  <span className="text-sm">Family Account</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}