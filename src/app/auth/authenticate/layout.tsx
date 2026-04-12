import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login or Sign Up - Secure OTP Authentication',
  description: 'Log in or create your AlgoLink account with secure passwordless OTP authentication.',
};

export default function AuthenticateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
