"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  Loader2,
  Volume2,
  VolumeX,
  AlertCircle,
  ChevronRight,
  Trash2,
  Send,
  Shield,
  Package,
  Scale,
  RefreshCw
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { fpoApi, FPOMember } from '@/lib/api';
import { useLanguage } from '@/lib/hooks/useLanguage';

interface PendingInvite {
  id: string;
  farmerPhone: string;
  farmerName?: string;
  status: 'pending' | 'expired';
  sentAt: Date;
  expiresAt: Date;
}

export default function FPOMembersPage() {
  const [role, setRole] = useState('fpo');
  const { language, speak, stopSpeaking, isSpeaking } = useLanguage();
  
  const [members, setMembers] = useState<FPOMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  // Remove member state
  const [memberToRemove, setMemberToRemove] = useState<FPOMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fpoApi.getMyFPO();
      setMembers(response.members || []);
      // In production, you'd also load pending invites from an API
      setPendingInvites([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
      // Mock data for development
      setMembers([
        { id: '1', name: 'Ramesh Kumar', phone: '+91 98765 43210', village: 'Madanapalle' },
        { id: '2', name: 'Lakshmi Devi', phone: '+91 87654 32109', village: 'Punganur' },
        { id: '3', name: 'Venkatesh Reddy', phone: '+91 76543 21098', village: 'Chittoor' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!invitePhone.trim()) return;
    
    setIsInviting(true);
    try {
      // Call the invite-member API
      // await fpoApi.inviteMember(invitePhone, inviteName);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInviteSuccess(true);
      setPendingInvites(prev => [...prev, {
        id: `inv-${Date.now()}`,
        farmerPhone: invitePhone,
        farmerName: inviteName || undefined,
        status: 'pending',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }]);
      
      setTimeout(() => {
        setShowInviteModal(false);
        setInvitePhone('');
        setInviteName('');
        setInviteSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setIsRemoving(true);
    try {
      // In production: await fpoApi.removeMember(fpoId, memberToRemove.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    (m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.phone?.includes(searchQuery) ||
     m.village?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const speakPageContent = () => {
    const content: Record<string, string> = {
      en: `FPO Members Management. You have ${members.length} registered farmers in your FPO. Use this page to invite new farmers, manage existing members, and track consent-based registrations.`,
      hi: `एफपीओ सदस्य प्रबंधन। आपके एफपीओ में ${members.length} पंजीकृत किसान हैं। नए किसानों को आमंत्रित करने, मौजूदा सदस्यों को प्रबंधित करने और सहमति-आधारित पंजीकरण को ट्रैक करने के लिए इस पृष्ठ का उपयोग करें।`,
    };
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(content[language] || content.en);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentRole={role} onRoleChange={setRole} />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading members...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentRole={role} onRoleChange={setRole} />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                {language === 'hi' ? 'सदस्य प्रबंधन' : 'Member Management'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'hi' 
                  ? `${members.length} पंजीकृत किसान`
                  : `${members.length} registered farmers`
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={speakPageContent}
              className="touch-target"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
          <Button onClick={() => setShowInviteModal(true)} size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            {language === 'hi' ? 'नया सदस्य जोड़ें' : 'Invite Member'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">{error}</p>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={loadMembers}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Members', value: members.length, icon: Users, color: 'bg-primary/10 text-primary' },
            { label: 'Pending Invites', value: pendingInvites.length, icon: Clock, color: 'bg-yellow-500/10 text-yellow-600' },
            { label: 'Verified', value: members.length, icon: Shield, color: 'bg-accent/10 text-accent' },
            { label: 'Active Listings', value: 12, icon: Package, color: 'bg-sky-500/10 text-sky-600' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingInvites.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={language === 'hi' ? 'नाम, फोन या गांव से खोजें...' : 'Search by name, phone, or village...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Members List */}
        {activeTab === 'members' && (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {searchQuery ? 'No members found' : 'No members yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Try a different search term'
                      : 'Invite farmers to join your FPO'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowInviteModal(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite First Member
                    </Button>
                  )}
                </div>
              ) : (
                filteredMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {member.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{member.name || 'Unknown'}</p>
                          <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </span>
                          {member.village && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {member.village}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.location.href = `tel:${member.phone}`}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </AnimatePresence>
        )}

        {/* Pending Invites */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingInvites.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No pending invites</h3>
                <p className="text-muted-foreground">
                  All invitations have been accepted or expired
                </p>
              </div>
            ) : (
              pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{invite.farmerName || invite.farmerPhone}</p>
                      <p className="text-sm text-muted-foreground">
                        Sent {invite.sentAt.toLocaleDateString()} • 
                        Expires {invite.expiresAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Send className="w-4 h-4 mr-1" />
                      Resend
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {language === 'hi' ? 'नया सदस्य आमंत्रित करें' : 'Invite New Member'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' 
                ? 'किसान को OTP के माध्यम से सहमति के लिए SMS भेजा जाएगा'
                : 'An SMS will be sent to the farmer for OTP-based consent'
              }
            </DialogDescription>
          </DialogHeader>

          {inviteSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Invitation Sent!</h3>
              <p className="text-muted-foreground">
                OTP has been sent to the farmer's phone
              </p>
            </motion.div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'hi' ? 'किसान का फ़ोन नंबर *' : 'Farmer Phone Number *'}
                  </label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    type="tel"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'hi' ? 'किसान का नाम (वैकल्पिक)' : 'Farmer Name (Optional)'}
                  </label>
                  <Input
                    placeholder={language === 'hi' ? 'नाम दर्ज करें' : 'Enter name'}
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className="bg-primary/5 rounded-lg p-3 text-sm">
                  <p className="font-medium text-primary mb-1">
                    {language === 'hi' ? 'सहमति प्रक्रिया' : 'Consent Process'}
                  </p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>1. {language === 'hi' ? 'किसान को OTP SMS मिलेगा' : 'Farmer receives OTP via SMS'}</li>
                    <li>2. {language === 'hi' ? 'OTP सत्यापन' : 'OTP verification'}</li>
                    <li>3. {language === 'hi' ? 'वॉयस कंसेंट (वैकल्पिक)' : 'Voice consent (optional)'}</li>
                    <li>4. {language === 'hi' ? 'FPO में स्वचालित रूप से जुड़ जाएगा' : 'Auto-added to FPO'}</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleInviteMember}
                  disabled={!invitePhone.trim() || isInviting}
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'hi' ? 'भेज रहा है...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {language === 'hi' ? 'OTP भेजें' : 'Send OTP'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Remove Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from your FPO?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
