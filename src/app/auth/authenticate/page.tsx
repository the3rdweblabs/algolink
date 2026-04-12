
// src/app/auth/authenticate/page.tsx
'use client';

import { useActionState, useState, useEffect, Suspense, useRef } from 'react';
import { requestOtp, verifyOtpAndLogin, resendOtp } from '@/app/actions/authActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, KeyRound, LogIn, RefreshCcw, ArrowRight } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link'; // Not used directly, but good to keep for potential future use
import { useRouter, useSearchParams } from 'next/navigation'; // useRouter/searchParams not directly used in this version
import { useFormStatus } from 'react-dom';

const initialRequestOtpState = {
  message: null,
  errors: {},
  success: false,
  email: '',
};

const initialVerifyOtpState = {
  message: null,
  errors: {},
  success: false,
};

const OTP_VALIDITY_DURATION_SECONDS = 10 * 60; // 10 minutes

function EmailSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending OTP...' : 'Send OTP'}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

function AuthenticationContent() {
  const [formStep, setFormStep] = useState<'email' | 'otp'>('email');
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otpValue, setOtpValue] = useState('');
  
  const [requestOtpState, requestOtpAction] = useActionState(requestOtp, initialRequestOtpState);
  const [verifyOtpState, verifyOtpAction] = useActionState(verifyOtpAndLogin, initialVerifyOtpState);
  
  const { toast } = useToast();
  const otpFormRef = useRef<HTMLFormElement>(null);
  const { pending: verifyOtpPending } = useFormStatus(); // For OTP verification form

  const [timeLeftForOtp, setTimeLeftForOtp] = useState(OTP_VALIDITY_DURATION_SECONDS);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendStatus, setResendStatus] = useState<{loading: boolean; message: string; success?: boolean}>({loading: false, message: ''});
  
  // Effect to reset countdown when formStep changes or when explicitly starting OTP step
  useEffect(() => {
    if (requestOtpState?.success && requestOtpState.email) {
      toast({ title: 'OTP Sent', description: requestOtpState.message || 'An OTP has been sent to your email.' });
      setEmailForOtp(requestOtpState.email);
      setFormStep('otp');
      setTimeLeftForOtp(OTP_VALIDITY_DURATION_SECONDS); // Reset countdown for new OTP
      setCanResendOtp(false);
    } else if (requestOtpState?.message && !requestOtpState.success) {
      toast({ title: 'Error', description: requestOtpState.message, variant: 'destructive' });
    }
  }, [requestOtpState, toast]);


  // Effect for OTP countdown timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (formStep === 'otp' && timeLeftForOtp > 0) {
      setCanResendOtp(false); // Disable resend while countdown is active
      timerId = setInterval(() => {
        setTimeLeftForOtp((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId);
            setCanResendOtp(true); // Enable resend when timer finishes
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeftForOtp === 0) {
      setCanResendOtp(true); // Ensure resend is enabled if timer reaches 0
    }
    
    return () => clearInterval(timerId); // Cleanup interval on unmount or if dependencies change
  }, [formStep, timeLeftForOtp]);


  useEffect(() => {
    // verifyOtpAction handles redirect on success
    if (verifyOtpState?.message && !verifyOtpState.success) {
      toast({ title: 'OTP Verification Failed', description: verifyOtpState.message, variant: 'destructive' });
    }
  }, [verifyOtpState, toast]);


  const handleResendOtp = async () => {
    if (!emailForOtp) {
      toast({ title: 'Error', description: 'Email address is missing to resend OTP.', variant: 'destructive' });
      return;
    }
    setResendStatus({loading: true, message: 'Sending...'});
    setCanResendOtp(false); // Disable while resending
    const result = await resendOtp(emailForOtp);
    
    if (result.success) {
      setTimeLeftForOtp(OTP_VALIDITY_DURATION_SECONDS); // Restart countdown
      setCanResendOtp(false); // Keep disabled as new countdown starts
      toast({
        title: 'OTP Resent',
        description: result.message,
      });
    } else {
      setCanResendOtp(true); // Allow trying again if resend failed
      toast({
        title: 'Error Resending OTP',
        description: result.message,
        variant: 'destructive',
      });
    }
    setResendStatus({loading: false, message: result.message, success: result.success });
  };

  const handleOtpComplete = (completedOtpValue: string) => {
    setOtpValue(completedOtpValue);
    if (otpFormRef.current && !verifyOtpPending) {
      setTimeout(() => {
        if (otpFormRef.current) {
           otpFormRef.current.requestSubmit();
        }
      }, 100);
    }
  };


  if (formStep === 'email') {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Login or Sign Up</CardTitle>
          <CardDescription>Enter your email to receive a One-Time Password (OTP).</CardDescription>
        </CardHeader>
        <form action={requestOtpAction}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-auth" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input 
                id="email-auth" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                defaultValue={requestOtpState?.email || ''}
              />
              {requestOtpState?.errors?.email && <p className="text-xs text-destructive">{requestOtpState.errors.email[0]}</p>}
            </div>
            {requestOtpState?.message && !requestOtpState.success && (
                 <p className="text-sm text-destructive text-center">{requestOtpState.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <EmailSubmitButton />
          </CardFooter>
        </form>
      </Card>
    );
  }

  // formStep === 'otp'
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <KeyRound className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-3xl font-bold">Enter OTP</CardTitle>
        <CardDescription>
          An OTP was sent to <strong className="break-all">{emailForOtp}</strong>. Please enter it below.
        </CardDescription>
      </CardHeader>
      <form action={verifyOtpAction} ref={otpFormRef}>
        <CardContent className="space-y-6">
          <InputOTP 
            maxLength={6} 
            value={otpValue}
            onChange={(value) => setOtpValue(value)}
            onComplete={handleOtpComplete}
          >
            <InputOTPGroup className="mx-auto">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <input type="hidden" name="otp" value={otpValue} />
          <input type="hidden" name="email" value={emailForOtp} />
          
          {verifyOtpState?.errors?.otp && <p className="text-xs text-destructive text-center">{verifyOtpState.errors.otp[0]}</p>}
          {verifyOtpState?.message && !verifyOtpState.success && (
            <p className="text-sm text-destructive text-center">{verifyOtpState.message}</p>
          )}
          {verifyOtpPending && (
            <p className="text-sm text-primary text-center animate-pulse">Verifying OTP...</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {formStep === 'otp' && (
            <p className="text-sm text-muted-foreground text-center tabular-nums">
              {timeLeftForOtp > 0
                ? `You can resend OTP in: ${Math.floor(timeLeftForOtp / 60)
                    .toString()
                    .padStart(2, '0')}:${(timeLeftForOtp % 60).toString().padStart(2, '0')}`
                : 'You can now resend the OTP.'}
            </p>
          )}
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleResendOtp} 
            disabled={resendStatus.loading || verifyOtpPending || !canResendOtp} 
            className="w-full"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${resendStatus.loading ? 'animate-spin' : ''}`} />
            {resendStatus.loading ? 'Resending...' : 'Resend OTP'}
          </Button>
          {resendStatus.message && !resendStatus.loading && !resendStatus.success && ( // Only show error message for resend here
            <p className="text-xs text-center text-destructive">
              {resendStatus.message}
            </p>
          )}
          <Button type="button" variant="link" onClick={() => { setFormStep('email'); setEmailForOtp(''); setOtpValue(''); setTimeLeftForOtp(OTP_VALIDITY_DURATION_SECONDS); setCanResendOtp(false); }} className="p-0" disabled={verifyOtpPending}>
            Change email address
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function AuthenticatePage() {
  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-center"><p>Loading authentication...</p></div>}>
        <AuthenticationContent />
      </Suspense>
    </div>
  );
}

