'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Camera, Save, X, Loader2, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { updateProfile } from '@/app/actions/profileActions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import NftSelector from './NftSelector';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  user: {
    userId: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatarUrl);
  const [isNftSelectorOpen, setIsNftSelectorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Track if any changes were made
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const nameChanged = displayName.trim() !== (user.displayName || '');
    const avatarChanged = previewUrl !== user.avatarUrl;
    setHasChanges(nameChanged || avatarChanged);
  }, [displayName, previewUrl, user.displayName, user.avatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 7 * 1024 * 1024) {
        toast({
            title: 'File too large',
            description: 'Please select an image smaller than 7MB.',
            variant: 'destructive',
        });
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 3) {
        toast({
            title: 'Invalid Name',
            description: 'Display name must be at least 3 characters.',
            variant: 'destructive',
        });
        return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('displayName', displayName.trim());
    
    // Determine if we are sending a file or a direct URL (NFT)
    if (fileInputRef.current?.files?.[0]) {
      formData.append('avatar', fileInputRef.current.files[0]);
    } else if (previewUrl && previewUrl !== user.avatarUrl) {
      // If previewUrl is a string and not the original one, it must be from NFT selector
      formData.append('avatarUrl', previewUrl);
    }

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Your profile has been updated.',
        });
        router.refresh();
      } else {
        toast({
          title: 'Update Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Profile save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred while saving.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
      setDisplayName(user.displayName || '');
      setPreviewUrl(user.avatarUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative group/card">
      <Card className="shadow-2xl border-white/5 bg-neutral-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-white/10 transition-all">
        <CardHeader className="p-8 relative">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Avatar Section */}
            <div className="relative shrink-0">
                <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-32 w-32 border-4 border-neutral-800 shadow-2xl ring-2 ring-primary/20 transition-all group-hover/avatar:ring-primary/50 overflow-hidden">
                        <AvatarImage src={previewUrl || ''} className="object-cover" />
                        <AvatarFallback className="bg-neutral-800 text-primary text-4xl font-bold">
                            {displayName ? displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all backdrop-blur-[2px]">
                        <Camera className="h-8 w-8 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Photo</span>
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                />
                <Button 
                    size="icon" 
                    variant="secondary"
                    onClick={() => setIsNftSelectorOpen(true)}
                    className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full border-2 border-neutral-900 shadow-xl hover:scale-110 transition-transform bg-primary text-white hover:bg-primary/90"
                    title="Select NFT"
                >
                    <Sparkles className="h-4 w-4" />
                </Button>
            </div>

            {/* Inputs Section */}
            <div className="flex-1 w-full space-y-6">
                <div className="space-y-1.5 w-full">
                    <label className="text-[10px] uppercase tracking-widest text-primary font-black ml-1">Username</label>
                    <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-2xl font-black h-14 w-full bg-black/40 border-white/5 ring-primary/10 transition-all focus:ring-primary/40 focus:border-primary/40 focus:bg-black/60 placeholder:opacity-30"
                        placeholder="Enter your username"
                        spellCheck={false}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 opacity-60">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Email Address</label>
                        <div className="flex items-center text-white gap-3 text-sm bg-white/5 h-11 px-4 rounded-xl border border-white/5 cursor-not-allowed">
                            <Mail className="h-4 w-4 text-primary/50" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    </div>
                    <div className="space-y-1.5 opacity-60">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-1">Account ID</label>
                        <div className="flex items-center text-white gap-3 text-sm bg-white/5 h-11 px-4 rounded-xl border border-white/5 cursor-not-allowed">
                            <User className="h-4 w-4 text-primary/50" />
                            <span className="font-mono text-[10px] truncate">{user.userId}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Dynamic Action Bar */}
        <div className={cn(
            "p-5 px-8 flex justify-between items-center transition-all duration-500 overflow-hidden",
            hasChanges ? "h-20 opacity-100 bg-primary/5 border-t border-primary/20" : "h-0 opacity-0 pointer-events-none"
        )}>
            <div className="flex items-center gap-2 text-primary">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold tracking-tight">You have unsaved changes</span>
            </div>
            <div className="flex gap-3">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDiscard}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-white hover:bg-white/10"
                >
                    <X className="mr-2 h-4 w-4" /> Discard
                </Button>
                <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 px-6 font-bold"
                >
                    {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                    )}
                </Button>
            </div>
        </div>
      </Card>

      <NftSelector 
        isOpen={isNftSelectorOpen}
        onClose={() => setIsNftSelectorOpen(false)}
        onSelect={(url) => setPreviewUrl(url)}
      />
    </div>
  );
}
