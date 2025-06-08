
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Eye, AlertCircle, FileText, Search, Filter, RefreshCw, User, Calendar, Shield, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useOptimizedAnimations } from "@/hooks/use-optimized-animations";
import { useNetworkAwareLoading } from "@/hooks/use-network-aware-loading";
import { withResilience } from "@/utils/network-resilience";

interface Profile {
  full_name: string | null;
  username: string | null;
  country: string | null;
  email: string | null;
}

interface KYCVerification {
  id: string;
  user_id: string;
  status: 'basic' | 'pending' | 'verified' | 'rejected';
  submitted_at: string;
  document_type: string;
  document_url: string;
  document_category?: string;
  notes?: string;
  additional_info?: any;
  rejection_reason?: string;
  verified_at?: string;
  reviewed_by?: string;
  profiles?: Profile;
}

const AdminKYCVerification = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocType, setSelectedDocType] = useState<string>("all");
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  const { shouldAnimate, getTransition } = useOptimizedAnimations();
  const { isLoadingWithFallback } = useNetworkAwareLoading(isLoading);
  const fetchVerifications = withResilience(async () => {
    try {
      setIsLoading(true);
      
      // Build the query based on active tab
      let query = supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:profiles (full_name, username, country, email)
        `);
      
      // Filter by status based on active tab
      if (activeTab !== "all") {
        query = query.eq('status', activeTab);
      }
      
      // Apply sort order
      query = query.order('submitted_at', { ascending: sortOrder === "oldest" });
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Apply client-side filtering
      let filteredData = data || [];
      
      // Filter by document type if selected
      if (selectedDocType !== "all") {
        filteredData = filteredData.filter(v => v.document_type === selectedDocType);
      }
      
      // Filter by search query if present
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(v => 
          (v.profiles?.full_name?.toLowerCase().includes(query)) ||
          (v.profiles?.username?.toLowerCase().includes(query)) ||
          (v.profiles?.email?.toLowerCase().includes(query)) ||
          (v.document_type?.toLowerCase().includes(query)) ||
          (v.profiles?.country?.toLowerCase().includes(query))
        );
      }
      
      setVerifications(filteredData);
    } catch (error: any) {
      console.error('Error fetching KYC verifications:', error);
      toast.error('Failed to load KYC verifications');
    } finally {
      setIsLoading(false);
    }
  }, { maxRetries: 2, retryDelay: 1000 });

  useEffect(() => {
    fetchVerifications();
  }, [activeTab, selectedDocType, sortOrder]);
  
  // Debounce search to avoid too many refreshes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVerifications();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const handleVerification = withResilience(async (id: string, userId: string, approved: boolean, reason?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Admin not authenticated");
      
      const timestamp = new Date().toISOString();
      
      // Update verification status
      let status: string;
      let notes: string;
      
      if (approved) {
        status = 'verified';
        notes = 'Verification approved';
      } else {
        status = 'rejected';
        notes = reason || 'Verification rejected';
      }
      
      const { error: verificationError } = await supabase
        .from('kyc_verifications')
        .update({ 
          status,
          notes,
          verified_at: timestamp,
          reviewed_by: user.id,
          rejection_reason: !approved ? reason : null
        })
        .eq('id', id);

      if (verificationError) throw verificationError;

      // Update profile KYC level
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          kyc_level: approved ? status : 'basic',
          kyc_verified_at: approved ? timestamp : null
        })
        .eq('id', userId);

      if (profileError) throw profileError;
      
      // Log the verification action
      await supabase
        .from('kyc_verification_logs')
        .insert({
          verification_id: id,
          user_id: userId,
          admin_id: user.id,
          action: approved ? 'approved' : 'rejected',
          reason: !approved ? reason : null,
          performed_at: timestamp
        });

      // Close dialogs if open
      setIsDialogOpen(false);
      setIsRejectionDialogOpen(false);
      
      toast.success(`KYC verification ${approved ? 'approved' : 'rejected'} successfully`);
      fetchVerifications();
    } catch (error: any) {
      console.error('Error updating KYC verification:', error);
      toast.error('Failed to update KYC verification');
    }
  }, { maxRetries: 2, retryDelay: 1000 });
  const getDocumentUrl = withResilience(async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('kyc_documents')
        .createSignedUrl(path, 300); // 5 minutes expiry

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to access document');
    }
  }, { maxRetries: 1, retryDelay: 500 });
  
  const viewVerificationDetails = (verification: KYCVerification) => {
    setSelectedVerification(verification);
    setIsDialogOpen(true);
  };
  
  const openRejectionDialog = (verification: KYCVerification) => {
    setSelectedVerification(verification);
    setRejectionReason("");
    setIsRejectionDialogOpen(true);
  };
  
  const handleRejectionSubmit = () => {
    if (!selectedVerification) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    handleVerification(selectedVerification.id, selectedVerification.user_id, false, rejectionReason);
  };
  
  const renderVerificationBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case 'verified':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-500">Basic</Badge>;
    }
  };
  
  const getDocumentTypeDisplay = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  if (isLoadingWithFallback) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse"></div>
          <div className="h-8 w-24 bg-white/10 rounded-md animate-pulse"></div>
        </div>
        <div className="h-12 w-full bg-white/10 rounded-md animate-pulse"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 w-full bg-white/10 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.3 })}
      >
        <div>
          <h2 className="text-2xl font-bold text-white">KYC Verification Management</h2>
          <p className="text-white/70 text-sm mt-1">Review and approve identity verification documents</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVerifications}
            className="border-white/10 hover:bg-white/5 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {verifications.filter(v => v.status === "pending").length} Pending
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.3, delay: 0.1 })}
        className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search by name, email, or country..."
              className="pl-9 bg-white/10 border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="min-w-[140px]">
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger className="bg-white/10 border-white/10 text-white">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="id_card">ID Card</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="utility_bill">Utility Bill</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[130px]">
              <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
                <SelectTrigger className="bg-white/10 border-white/10 text-white">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-white/5">
            <TabsTrigger value="pending" className="text-white data-[state=active]:bg-primary">
              Pending
            </TabsTrigger>
            <TabsTrigger value="verified" className="text-white data-[state=active]:bg-primary">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-white data-[state=active]:bg-primary">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-primary">
              All
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {verifications.length === 0 ? (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="flex items-center justify-center p-10">
                  <div className="text-center text-white/50">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {activeTab !== "all" ? activeTab : ""} KYC verifications found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {verifications.map((verification) => (
                  <motion.div
                    key={verification.id}
                    initial={shouldAnimate ? { opacity: 0, y: 5 } : undefined}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getTransition({ duration: 0.2 })}
                  >
                    <Card className="border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div className="mb-4 sm:mb-0">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white/10 rounded-full">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <h3 className="font-medium text-white">
                                {verification.profiles?.full_name || verification.profiles?.username || 'Unknown User'}
                              </h3>
                              {renderVerificationBadge(verification.status)}
                            </div>
                            
                            <div className="ml-8 space-y-1 mt-1">
                              {verification.profiles?.email && (
                                <p className="text-sm text-white/70">
                                  {verification.profiles.email}
                                </p>
                              )}
                              <div className="flex items-center text-xs text-white/50 gap-4">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(verification.submitted_at).toLocaleDateString()}
                                </span>
                                {verification.profiles?.country && (
                                  <span>{verification.profiles.country}</span>
                                )}
                                <span>{getDocumentTypeDisplay(verification.document_type)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                              onClick={() => viewVerificationDetails(verification)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            
                            {verification.status === 'pending' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handleVerification(verification.id, verification.user_id, true)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openRejectionDialog(verification)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Detailed View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/10 border-white/10 backdrop-blur-md text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Verification Details</DialogTitle>
            <DialogDescription className="text-white/70">
              Review document and user information
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-white/50">Name</p>
                        <p className="font-medium">
                          {selectedVerification.profiles?.full_name || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Email</p>
                        <p className="font-medium">
                          {selectedVerification.profiles?.email || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Country</p>
                        <p className="font-medium">
                          {selectedVerification.profiles?.country || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/50">User ID</p>
                        <p className="font-medium text-xs">
                          {selectedVerification.user_id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Document Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-white/50">Document Type</p>
                        <p className="font-medium">
                          {getDocumentTypeDisplay(selectedVerification.document_type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Category</p>
                        <p className="font-medium">
                          {selectedVerification.document_category === 'id' ? 'Identity Document' : 
                           selectedVerification.document_category === 'address' ? 'Proof of Address' : 
                           'Unspecified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Submitted</p>
                        <p className="font-medium">
                          {new Date(selectedVerification.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Status</p>
                        <p className="font-medium">
                          {renderVerificationBadge(selectedVerification.status)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {selectedVerification.notes && (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80">{selectedVerification.notes}</p>
                  </CardContent>
                </Card>
              )}
              
              {selectedVerification.rejection_reason && (
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      Rejection Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80">{selectedVerification.rejection_reason}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="pt-2">
                <Button
                  onClick={() => getDocumentUrl(selectedVerification.document_url)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Document
                </Button>
              </div>
              
              {selectedVerification.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleVerification(selectedVerification.id, selectedVerification.user_id, true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Verification
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDialogOpen(false);
                      openRejectionDialog(selectedVerification);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Verification
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent className="bg-white/10 border-white/10 backdrop-blur-md text-white">
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription className="text-white/70">
              Provide a reason why this verification is being rejected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Textarea 
              placeholder="Please explain why this verification is being rejected..."
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            
            <Select
              onValueChange={(value) => {
                if (value !== "custom") {
                  setRejectionReason(value);
                }
              }}
            >
              <SelectTrigger className="bg-white/10 border-white/10 text-white">
                <SelectValue placeholder="Select a common reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Document is not clearly visible">Document is not clearly visible</SelectItem>
                <SelectItem value="Document is expired">Document is expired</SelectItem>
                <SelectItem value="Information does not match account details">Information doesn't match account</SelectItem>
                <SelectItem value="Document appears to be altered or forged">Document appears altered/forged</SelectItem>
                <SelectItem value="custom">Custom reason (type above)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setIsRejectionDialogOpen(false)}
              className="border-white/10 hover:bg-white/5 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectionSubmit}
              disabled={!rejectionReason.trim()}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCVerification;
