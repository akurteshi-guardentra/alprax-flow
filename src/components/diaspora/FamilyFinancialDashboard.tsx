import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFamilyGroups } from '@/hooks/useFamilyGroups';
import { 
  Users, 
  Plus, 
  Target, 
  TrendingUp, 
  Heart,
  Euro,
  Calendar,
  Share2,
  Crown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function FamilyFinancialDashboard() {
  const { familyGroups, createFamilyGroup, joinFamilyGroup, updateContribution, isCreating, isJoining } = useFamilyGroups();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyGoal: ''
  });

  const handleCreateGroup = () => {
    createFamilyGroup({
      name: formData.name,
      description: formData.description,
      monthlyGoal: parseFloat(formData.monthlyGoal) || 0
    });
    setFormData({ name: '', description: '', monthlyGoal: '' });
    setIsCreateDialogOpen(false);
  };

  const handleJoinGroup = () => {
    if (joinCode.trim()) {
      joinFamilyGroup(joinCode.trim().toUpperCase());
      setJoinCode('');
      setIsJoinDialogOpen(false);
    }
  };

  const shareGroupCode = (groupCode: string) => {
    navigator.clipboard.writeText(groupCode);
    toast.success('Group code copied to clipboard');
  };

  const calculateProgress = (saved: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((saved / goal) * 100, 100);
  };

  if (!familyGroups || familyGroups.length === 0) {
    return (
      <Card className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-kosovo-yellow" />
            Family Financial Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-white/10 p-6 rounded-lg">
              <Heart className="h-12 w-12 text-kosovo-yellow mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Stronger Together
              </h3>
              <p className="text-white/70 mb-4">
                Create or join a family group to track shared financial goals, 
                coordinate transfers, and support each other.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-kosovo-yellow hover:bg-kosovo-yellow/90 text-black font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Create Family Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Group Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Kurteshi Family"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your family group..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal">Monthly Savings Goal (€)</Label>
                      <Input
                        id="goal"
                        type="number"
                        placeholder="1000"
                        value={formData.monthlyGoal}
                        onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateGroup}
                      disabled={!formData.name.trim() || isCreating}
                      className="w-full"
                    >
                      {isCreating ? 'Creating...' : 'Create Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Users className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Join Family Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="join-code">Group Code</Label>
                      <Input
                        id="join-code"
                        placeholder="Enter group code (e.g., ABC123)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="bg-white/10 border-white/20 text-white uppercase"
                      />
                    </div>
                    <Button 
                      onClick={handleJoinGroup}
                      disabled={!joinCode.trim() || isJoining}
                      className="w-full"
                    >
                      {isJoining ? 'Joining...' : 'Join Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {familyGroups.map((group) => {
        const progress = calculateProgress(group.total_savings, group.monthly_goal);
        const isAdmin = group.family_members?.some((member: any) => 
          member.user_id === group.creator_id && member.role === 'admin'
        );

        return (
          <Card key={group.id} className="border-none shadow-lg bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-kosovo-yellow" />
                    {group.name}
                    {isAdmin && <Crown className="h-4 w-4 text-kosovo-yellow" />}
                  </CardTitle>
                  {group.description && (
                    <p className="text-white/70 mt-1">{group.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => shareGroupCode(group.group_code)}
                  className="text-white/70 hover:text-white"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {group.group_code}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10">
                  <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="members" className="text-white data-[state=active]:bg-white/20">
                    Members
                  </TabsTrigger>
                  <TabsTrigger value="goals" className="text-white data-[state=active]:bg-white/20">
                    Goals
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg text-center">
                      <Euro className="h-6 w-6 text-kosovo-yellow mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        €{group.total_savings.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/70">Total Savings</div>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg text-center">
                      <Target className="h-6 w-6 text-kosovo-yellow mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">
                        €{group.monthly_goal.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/70">Monthly Goal</div>
                    </div>
                  </div>

                  {group.monthly_goal > 0 && (
                    <div className="bg-white/10 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Progress this month</span>
                        <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-sm text-white/70 text-center">
                        €{(group.monthly_goal - group.total_savings).toFixed(2)} remaining
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="members" className="space-y-3">
                  {group.family_members?.map((member: any) => (
                    <div key={member.id} className="bg-white/10 p-3 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-kosovo-yellow rounded-full flex items-center justify-center">
                          <span className="text-black font-medium text-sm">
                            {member.user_id.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            Member {member.user_id.substring(0, 8)}...
                            {member.role === 'admin' && (
                              <Badge variant="secondary" className="ml-2">Admin</Badge>
                            )}
                          </div>
                          <div className="text-white/70 text-sm">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-kosovo-yellow font-medium">
                          €{member.contribution_amount.toFixed(2)}
                        </div>
                        <div className="text-white/70 text-sm">Contributed</div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-kosovo-yellow" />
                      <h4 className="text-white font-medium">Upcoming Transfers</h4>
                    </div>
                    <div className="text-white/70 text-sm">
                      No scheduled transfers yet. Family members can set up recurring transfers to help reach your goals.
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-kosovo-yellow" />
                      <h4 className="text-white font-medium">Performance</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-white">
                          {group.family_members?.length || 0}
                        </div>
                        <div className="text-sm text-white/70">Active Members</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">3</div>
                        <div className="text-sm text-white/70">Months Active</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Another Family Group
        </Button>
      </div>
    </div>
  );
}