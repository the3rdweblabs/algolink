// src/app/docs/page.tsx
'use client';

import React, { useState, useEffect, useRef } from "react";
import type { Metadata } from 'next';
import Link from "next/link";
import { 
  User, 
  Code2, 
  LinkIcon as LinkIconLucide, 
  Settings, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink, 
  Mail, 
  KeyRound, 
  Info as InfoIcon, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Search,
  Users,
  Building2,
  Lock,
  Globe,
  Database,
  Box,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Note: Metadata must be in a separate layout file if using 'use client' or exported from a non-client component.
// For now, we omit the export metadata here to avoid 'use client' conflict, or move it to layout.

const SECTIONS = [
  { id: 'intro', label: 'Introduction', icon: BookOpen },
  { id: 'features', label: 'Core Features', icon: Zap },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'guides', label: 'User Guides', icon: Users },
  { id: 'api', label: 'Developer API', icon: Code2 },
  { id: 'use-cases', label: 'Use Cases', icon: Building2 },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-10% 0% -70% 0%' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-12">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit">
        <div className="glass-glow border border-white/10 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Documentation
          </h3>
          <nav className="space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <section.icon className="h-4 w-4 shrink-0" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl space-y-24 pb-24">
        
        {/* Introduction */}
        <section 
          id="intro" 
          ref={(el) => { sectionRefs.current['intro'] = el; }}
          className="scroll-mt-24 space-y-8"
        >
          <div className="space-y-4">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 text-xs">
              Platform Overview
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic">
              AlgoLink Identity.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              AlgoLink is a premium identity primitive for the Algorand blockchain. We bridge the gap between traditional communication (Email) and decentralized finance (Wallets) with an emphasis on <span className="text-foreground font-semibold underline decoration-primary/30">AI-driven security</span> and user-controlled privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-glow border-white/5 bg-white/[0.02]">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg italic">The Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                We believe blockchain addresses shouldn't be scary. By linking a human-readable identifier like email, we make sending assets as natural as sending a message.
              </CardContent>
            </Card>
            <Card className="glass-glow border-white/5 bg-white/[0.02]">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg italic">Ecosystem Fit</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                AlgoLink complements services like **NFD** and **ANS** by adding an off-chain discovery layer that enables cross-application resolution for billions of email users.
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* Core Features */}
        <section 
          id="features" 
          ref={(el) => { sectionRefs.current['features'] = el; }}
          className="scroll-mt-24 space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">Core Features</h2>
            <p className="text-muted-foreground">The tools that power your decentralized identity.</p>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  <h3 className="text-xl font-bold italic">1:1 Wallet-to-Email Linking</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Strict enforcement of a single active link ensures your identity is globally unique and prevents resolution ambiguity. Each link requires a small linkage fee to prevent spam and ensure registry integrity.
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-white/5 text-foreground border-white/10">Unique Index</Badge>
                  <Badge className="bg-white/5 text-foreground border-white/10">Immutable History</Badge>
                </div>
              </div>
              <div className="w-full md:w-1/2 bg-white/[0.03] rounded-2xl border border-white/5 p-6 font-mono text-xs">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                 </div>
                 <div className="space-y-2 text-primary/80">
                    <p className="text-blue-400">// SQL Constraint</p>
                    <p>ALTER TABLE wallet_links</p>
                    <p>ADD CONSTRAINT <span className="text-yellow-400">user_id_unique</span></p>
                    <p>UNIQUE (user_id);</p>
                 </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse gap-8 items-start pt-8 border-t border-white/5">
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex items-center gap-3 text-orange-500">
                  <ShieldCheck className="h-6 w-6" />
                  <h3 className="text-xl font-bold italic">AI-Powered Safety</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our custom **Genkit Flow** analyzes every pasted address for "Address Poisoning" patterns. It compares your intent with the clipboard address to ensure you never send funds to a malicious vanity address.
                </p>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Safe Address Verified
                   </div>
                   <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
                      <AlertTriangle className="h-3 w-3" /> Suspicious Pattern Detected
                   </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 bg-white/[0.03] rounded-2xl border border-white/5 p-6">
                 <div className="bg-background rounded-lg p-4 border border-white/5 text-sm space-y-3">
                    <div className="p-2.5 bg-muted rounded-md border border-orange-500/20 flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4 text-orange-500" />
                       <span className="font-mono text-xs truncate">B0BS...ADDRESS...POISONED</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold text-center">AI Suggested Correction</p>
                    <div className="p-2.5 bg-green-500/10 rounded-md border border-green-500/20 flex items-center gap-2">
                       <CheckCircle2 className="h-4 w-4 text-green-500" />
                       <span className="font-mono text-xs truncate">BOBS...ADDRESS...VALID</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* Architecture */}
        <section 
          id="architecture" 
          ref={(el) => { sectionRefs.current['architecture'] = el; }}
          className="scroll-mt-24 space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">System Architecture</h2>
            <p className="text-muted-foreground">A breakdown of the AlgoLink technology stack.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-4">
                <Box className="h-6 w-6 text-primary shrink-0" />
                <div>
                   <h4 className="font-semibold text-sm">Next.js 15+ (App Router)</h4>
                   <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Modern framework utilizing Server Actions and React Server Components for ultra-fast, search-engine-optimized blockchain data rendering.</p>
                </div>
             </div>
             <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-4">
                <Database className="h-6 w-6 text-primary shrink-0" />
                <div>
                   <h4 className="font-semibold text-sm">SQLite & Better-SQLite3</h4>
                   <p className="text-xs text-muted-foreground mt-1 leading-relaxed">A specialized relational layer handles performant mappings between emails and wallets, with strict unique constraints at the engine level.</p>
                </div>
             </div>
             <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-4">
                <Cpu className="h-6 w-6 text-primary shrink-0" />
                <div>
                   <h4 className="font-semibold text-sm">Genkit & Google Gemini</h4>
                   <p className="text-xs text-muted-foreground mt-1 leading-relaxed">The AI orchestration layer (Genkit) processes suspicious patterns across the blockchain ledger in real-time using Gemini models.</p>
                </div>
             </div>
             <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-4">
                <Navigation className="h-6 w-6 text-primary shrink-0" />
                <div>
                   <h4 className="font-semibold text-sm">@txnlab/use-wallet-react</h4>
                   <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Unified wallet connection standard supporting Pera, Defly, Daffi, and more, ensuring a broad user base can interact with the registry.</p>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xl font-bold italic">Process Flow: Linking a Wallet</h3>
             <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-8 relative">
                <div className="flex items-center gap-4">
                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                   <div className="flex-1">
                      <p className="text-sm font-semibold">OTP Identity Verification</p>
                      <p className="text-xs text-muted-foreground">User verifies account email via passwordless OTP (Firebase/Auth logic).</p>
                   </div>
                   <ChevronRight className="text-muted-foreground/30 hidden md:block" />
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                   <div className="flex-1">
                      <p className="text-sm font-semibold">Linkage Fee Payment</p>
                      <p className="text-xs text-muted-foreground">A ~0.001 ALGO fee is paid to the treasury to signal permanent intent.</p>
                   </div>
                   <ChevronRight className="text-muted-foreground/30 hidden md:block" />
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                   <div className="flex-1">
                      <p className="text-sm font-semibold">Registry Update</p>
                      <p className="text-xs text-muted-foreground">Atomic write to the Database linking unique user_id to the signed wallet.</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* User Guides */}
        <section 
          id="guides" 
          ref={(el) => { sectionRefs.current['guides'] = el; }}
          className="scroll-mt-24 space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">User Guides</h2>
            <p className="text-muted-foreground">Step-by-step instructions for managing your identity.</p>
          </div>

          <div className="space-y-6">
             <h3 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Privacy & Visibility
             </h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
                By default, your link is **Publicly Resolvable**. This means anyone with your email address can find your wallet via our API. To hide this, go to **Settings** and toggle off the public resolution. You will still see the link on your dashboard, but it will be hidden from the public API.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                   <p className="text-xs font-bold text-green-500 uppercase mb-1">Public Mode</p>
                   <p className="text-xs text-muted-foreground">Ideal for freelancers, organizations, and public figures who want to receive payments via email.</p>
                </div>
                <div className="p-4 rounded-lg bg-muted border border-border">
                   <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Private Mode</p>
                   <p className="text-xs text-muted-foreground">Best for personal safety or internal organization linking where external disclosure is not required.</p>
                </div>
             </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/5">
             <h3 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" /> Understanding AI Badges
             </h3>
             <div className="space-y-4">
                <div className="flex items-start gap-4">
                   <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Safe</Badge>
                   <p className="text-xs text-muted-foreground">The AI has verified the address as having a normal transaction history and no proximity to known poisoning scripts.</p>
                </div>
                <div className="flex items-start gap-4">
                   <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Suspicious</Badge>
                   <p className="text-xs text-muted-foreground">The AI detected a "Low Trust" score. This often happens with fresh addresses or those that mimic high-value destinations.</p>
                </div>
                <div className="flex items-start gap-4">
                   <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Corrected</Badge>
                   <p className="text-xs text-muted-foreground">AI detected a massive vanity-address mismatch on the clipboard. Use the suggested address instead.</p>
                </div>
             </div>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* Developer API */}
        <section 
          id="api" 
          ref={(el) => { sectionRefs.current['api'] = el; }}
          className="scroll-mt-24 space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">Developer Reference</h2>
            <p className="text-muted-foreground">Integrate AlgoLink resolution into your own dApps.</p>
          </div>

          <div className="space-y-8">
             <div className="space-y-4">
                <h3 className="text-xl font-semibold">Resolution API</h3>
                <p className="text-sm text-muted-foreground">The primary endpoint for resolving identifiers.</p>
                <div className="bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden">
                   <div className="flex items-center gap-2 px-4 py-2 bg-white/5 text-xs font-mono">
                      <span className="text-green-500 font-bold">GET</span>
                      <span className="text-foreground/60">/api/resolveEmail?email=demo@example.com</span>
                   </div>
                   <div className="p-4 space-y-4">
                      <div className="space-y-1">
                         <p className="text-xs font-bold uppercase text-muted-foreground">Response (200 OK)</p>
                         <pre className="text-xs p-3 bg-background rounded border border-white/5 text-primary/90">
{`{
  "email": "demo@example.com",
  "walletAddress": "BOBSADDRESS..."
}`}
                         </pre>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs font-bold uppercase text-muted-foreground">Error (404 Not Found)</p>
                         <pre className="text-xs p-3 bg-background rounded border border-white/5 text-red-400">
{`{
  "error": "No public wallet link found for this email."
}`}
                         </pre>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                   <Cpu className="h-5 w-5 text-primary" /> Genkit AI Integration
                </h3>
                <p className="text-sm text-muted-foreground">
                   AlgoLink exposes internal Genkit flows that can be accessed via Server Actions for custom validation logic.
                </p>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                   <h4 className="text-xs font-bold uppercase text-primary/80">Flow Specification: `detectSuspiciousAddress`</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="space-y-2">
                         <p className="text-muted-foreground">// Input Schema</p>
                         <p className="text-foreground/80">address: <span className="text-orange-400">string</span></p>
                         <p className="text-foreground/80">expected: <span className="text-orange-400">string?</span></p>
                      </div>
                      <div className="space-y-2">
                         <p className="text-muted-foreground">// Output Schema</p>
                         <p className="text-foreground/80">isSuspicious: <span className="text-green-400">boolean</span></p>
                         <p className="text-foreground/80">reason: <span className="text-green-400">string</span></p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <Separator className="bg-white/5" />

        {/* Use Cases */}
        <section 
          id="use-cases" 
          ref={(el) => { sectionRefs.current['use-cases'] = el; }}
          className="scroll-mt-24 space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight italic">Platform Use Cases</h2>
            <p className="text-muted-foreground">How AlgoLink solves real problems in the Algorand ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card className="glass-glow bg-white/[0.01] border-white/5">
                <CardHeader>
                   <Users className="h-6 w-6 text-primary mb-2" />
                   <CardTitle className="text-base italic">Gig Economy</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                   Freelancers can link their business email to their wallet, allowing clients to "pay the email" without copying long SHA-256 addresses manually.
                </CardContent>
             </Card>
             <Card className="glass-glow bg-white/[0.01] border-white/5">
                <CardHeader>
                   <ShieldCheck className="h-6 w-6 text-orange-500 mb-2" />
                   <CardTitle className="text-base italic">High-Value Transfers</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                   Use the AI detective to ensure your multisig or treasury destinations haven't been "poisoned" by vanity mimicry addresses on the clipboard.
                </CardContent>
             </Card>
             <Card className="glass-glow bg-white/[0.01] border-white/5">
                <CardHeader>
                   <Building2 className="h-6 w-6 text-blue-500 mb-2" />
                   <CardTitle className="text-base italic">Organization Identity</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                   Centralize all sub-addresses of an organization under a single parent email domain for internal management and public verification.
                </CardContent>
             </Card>
          </div>

          <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 flex flex-col items-center text-center space-y-4">
             <RocketIcon className="h-12 w-12 text-primary" />
             <h3 className="text-2xl font-bold italic">Ready to link your first identity?</h3>
             <p className="text-muted-foreground max-w-lg">
                Join thousands of users securing their Algorand transactions with email-mapped identities.
             </p>
             <Button asChild size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20">
                <Link href="/linkWallet">
                   Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
             </Button>
          </div>
        </section>

      </main>
    </div>
  );
}

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.49 1.26-1.05 1.63-1.63l7.93-7.93-4.14-4.14-7.93 7.93c-.58.37-1.14.92-1.63 1.63z" />
      <path d="M14.5 3.5l4 4" />
      <path d="M10.16 8.84l.79.79" />
      <path d="M15 7.33l-1.67-1.67" />
      <path d="M13.42 12.58l.79.79" />
      <path d="M15.5 13.5c1.4-1.4 1.4-3.6 0-5s-3.6-1.4-5 0" />
      <path d="M18.5 5.5s-2.5-1.5-4-1" />
      <path d="M21.5 8.5s-1.5-2.5-1-4" />
      <path d="M12.5 15.5l.5.5c2.5 2.5 7 2.5 9.5 0s2.5-7 0-9.5l-.5-.5" />
    </svg>
  )
}

function Navigation(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
}

