import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

// Define valid KYC statuses that match the database enum
type KYCVerificationStatus = 'pending' | 'verified' | 'rejected';

// Define valid profile KYC levels that match the profiles table
type ProfileKYCLevel = 'pending' | 'verified' | 'basic';

interface KYCVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: KYCVerificationStatus;
  submitted_at: string;
  verified_at?: string;
  notes?: string;
  profiles?: {
    full_name?: string;
    username?: string;
    country?: string;
  };
}

const AdminKYCVerification = () => {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [notes, setNotes] = useState('');

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            country
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        profiles: item.profiles as any
      })) || [];
      
      setVerifications(transformedData as KYCVerification[]);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleStatusUpdate = async (verificationId: string, newStatus: KYCVerificationStatus, notes?: string) => {
    try {
      // Update the KYC verification record
      const { error } = await supabase
        .from('kyc_verifications')
        .update({ 
          status: newStatus,
          verified_at: newStatus === 'verified' ? new Date().toISOString() : null,
          notes: notes || null
        })
        .eq('id', verificationId);

      if (error) throw error;
      
      // Also update the user's profile KYC level
      const verification = verifications.find(v => v.id === verificationId);
      if (verification) {
        // Map KYC verification status to profile kyc_level
        const getProfileKycLevel = (status: KYCVerificationStatus): ProfileKYCLevel => {
          switch (status) {
            case 'verified':
              return 'verified';
            case 'rejected':
              return 'basic';
            case 'pending':
            default:
              return 'pending';
          }
        };
        
        const profileKycLevel: ProfileKYCLevel = getProfileKycLevel(newStatus);
        
        const profileUpdate = {
          kyc_level: profileKycLevel,
          kyc_verified_at: newStatus === 'verified' ? new Date().toISOString() : null
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', verification.user_id);

        if (profileError) throw profileError;
      }

      toast.success(`Verification ${newStatus}`);
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">KYC Verifications</h1>
      {loading ? (
        <p>Loading verifications...</p>
      ) : (
        <Table>
          <TableCaption>A list of KYC verifications for users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>
                  {verification.profiles?.full_name || verification.profiles?.username || 'N/A'}
                  {verification.profiles?.country && ` (${verification.profiles.country})`}
                </TableCell>
                <TableCell>{verification.document_type}</TableCell>
                <TableCell>{new Date(verification.submitted_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {verification.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                  {verification.status === 'verified' && <Badge className="bg-green-500 text-white border-none">Verified <CheckCircle className="w-4 h-4 ml-1" /></Badge>}
                  {verification.status === 'rejected' && <Badge className="bg-red-500 text-white border-none">Rejected <AlertTriangle className="w-4 h-4 ml-1" /></Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedVerification(verification)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>KYC Verification Details</DialogTitle>
                        <DialogDescription>
                          View and update the status of this KYC verification.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            User
                          </Label>
                          <Input id="name" value={verification.profiles?.full_name || verification.profiles?.username || 'N/A'} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="documentType" className="text-right">
                            Document Type
                          </Label>
                          <Input id="documentType" value={verification.document_type} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="submittedAt" className="text-right">
                            Submitted At
                          </Label>
                          <Input id="submittedAt" value={new Date(verification.submitted_at).toLocaleDateString()} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="status" className="text-right">
                            Status
                          </Label>
                          <Input id="status" value={verification.status} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="documentUrl" className="text-right">
                            Document URL
                          </Label>
                          <Input id="documentUrl" value={verification.document_url} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="notes" className="text-right">
                            Notes
                          </Label>
                          <Input
                            id="notes"
                            className="col-span-3"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="secondary" onClick={() => handleStatusUpdate(verification.id, 'verified', notes)}>Verify</Button>
                        <Button variant="destructive" onClick={() => handleStatusUpdate(verification.id, 'rejected', notes)}>Reject</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminKYCVerification;
