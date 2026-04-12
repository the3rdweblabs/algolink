
// src/app/page.tsx
import type React from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Code, FileText, Lightbulb, MessageSquare, Play, Rocket, LinkIcon as LinkIconLucide, Cpu, ShieldCheck, Settings, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import AnimatedHeading from "@/components/layout/AnimatedHeading";
import RocketBadge from '@/components/layout/RocketBadge';

interface ResourceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}

function ResourceCard({ icon, title, description, link }: ResourceCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="rounded-md bg-primary/10 p-3 text-primary">{icon}</div>
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" className="text-primary hover:text-primary/80" asChild>
          <Link href={link} className="flex items-center p-2">
            <span className="flex items-center">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

interface FaqItemProps {
  question: string
  answer: string
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-medium text-foreground">{question}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  )
}

const algolinkFeatures = [
  {
    icon: <LinkIconLucide className="h-6 w-6" />,
    title: "Wallet Linking",
    description: "Understand how AlgoLink securely associates your email with your Algorand wallet.",
    link: "/linkWallet"
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Email-to-Wallet Resolution",
    description: "Learn about our API service for querying wallet addresses via email (for public links).",
    link: "/docs#developer-docs-api"
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Suspicious Address Detection",
    description: "How our AI helps in identifying and suggesting corrections for potentially 'poisoned' addresses.",
    link: "/docs#user-docs-dashboard"
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Privacy Controls",
    description: "Detailed insight into managing the public visibility of your email-wallet links.",
    link: "/settings"
  }
];

const algorandBasics = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "What is Algorand?",
    description: "An overview of the Algorand blockchain, its technology, and ecosystem.",
    link: "https://www.algorand.com/technology"
  },
  {
    icon: <Play className="h-6 w-6" />,
    title: "Understanding Pera Wallet",
    description: "Learn about Pera Wallet, the official wallet for Algorand, and its features.",
    link: "https://perawallet.app/"
  }
];

const securityFeatures = [
  {
    icon: <Code className="h-6 w-6" />,
    title: "Address Poisoning Explained",
    description: "Understand the risks of address poisoning scams and how to protect yourself.",
    link: "https://www.coinbase.com/learn/crypto-basics/what-is-address-poisoning"
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Our Security Practices",
    description: "Learn how AlgoLink prioritizes the security of your data and connections.",
    link: "/docs#security"
  }
];


export default function GetStartedPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mx-auto max-w-3xl">

          <div className="relative inline-block mx-auto mb-12">
            <Rocket className={cn("h-16 w-16 text-primary", "animate-rocket-launch")} />
            <RocketBadge />
          </div>

          <AnimatedHeading
            text="Get Started with AlgoLink"
            className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl h-12 flex items-center justify-center"
            typingSpeed={70}
          />
          <p className="mb-8 text-xl text-muted-foreground">
            Welcome! Follow these simple steps to link your Algorand wallet and explore the features of AlgoLink.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button size="lg" asChild>
                  <Link href="/linkWallet">
                    Link Your Wallet Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Link Algorand Wallet</h4>
                    <p className="text-sm">
                      Securely connect your Pera Wallet to an email and start managing your Algorand identity with AlgoLink.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/docs">
                    View Docs
                    <FileText className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Explore Documentation</h4>
                    <p className="text-sm">
                      Find detailed user guides and developer references for AlgoLink features and APIs.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="mb-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground">How AlgoLink Works</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                1
              </div>
              <CardTitle className="text-xl">Create Your Account</CardTitle>
              <CardDescription>Login or Sign up with your email via OTP.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quickly <Link href="/auth/authenticate" className="text-primary hover:underline font-medium">login or sign up</Link> for an AlgoLink account using a One-Time Password sent to your email. No passwords needed!
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80" asChild>
                <Link href="/auth/authenticate" className="flex items-center p-2">
                   <span className="flex items-center">Login / Sign Up <UserPlus className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                2
              </div>
              <CardTitle className="text-xl">Link Your Wallet</CardTitle>
              <CardDescription>Connect Pera Wallet to a public email.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the <Link href="/linkWallet" className="text-primary hover:underline font-medium">wallet linking page</Link> to securely connect your Algorand Pera Wallet to a public email address.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80" asChild>
                <Link href="/linkWallet" className="flex items-center p-2">
                  <span className="flex items-center">Link Wallet <LinkIconLucide className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                3
              </div>
              <CardTitle className="text-xl">Control Your Privacy</CardTitle>
              <CardDescription>Manage public visibility in settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visit the <Link href="/settings" className="text-primary hover:underline font-medium">settings page</Link> to decide if your email-to-wallet link is publicly resolvable or private.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80" asChild>
                <Link href="/settings" className="flex items-center p-2">
                  <span className="flex items-center">Adjust Settings <Settings className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
            </CardFooter>
          </Card>

           <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                4
              </div>
              <CardTitle className="text-xl">Smart & Secure Linking</CardTitle>
              <CardDescription>Benefit from AI-powered address checks.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AlgoLink enhances security with AI that helps detect suspicious wallet addresses, adding confidence to your email links.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full justify-start p-0 text-primary hover:text-primary/80" asChild>
                <Link href="/docs#user-docs-dashboard" className="flex items-center p-2">
                  <span className="flex items-center">Explore AI Security <Cpu className="ml-2 h-4 w-4" /></span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Resources Section */}
      <section className="mb-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground">Learn More About AlgoLink & Algorand</h2>
        <Tabs defaultValue="algolink" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="algolink">AlgoLink Features</TabsTrigger>
            <TabsTrigger value="algorand">Algorand Basics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="algolink" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {algolinkFeatures.map((card) => (
                <ResourceCard
                  key={card.link}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  link={card.link}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="algorand" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {algorandBasics.map((card) => (
                 <ResourceCard
                  key={card.link}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  link={card.link}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {securityFeatures.map((card) => (
                <ResourceCard
                  key={card.link}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  link={card.link}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl space-y-6">
          <FaqItem
            question="What is Pera Wallet and why is it used?"
            answer="Pera Wallet is the official and most popular wallet for the Algorand blockchain. AlgoLink uses Pera Wallet Connect SDK to allow users to securely connect their existing Algorand wallets without AlgoLink ever needing access to private keys."
          />
          <FaqItem
            question="Is linking my email to my wallet address safe?"
            answer="Yes, AlgoLink is designed with security in mind. The connection is established through your Pera Wallet. You also have control over whether this link is public or private. Private links are not resolvable by others through our API."
          />
          <FaqItem
            question="What is 'address poisoning'?"
            answer="Address poisoning is a scam where attackers send tiny amounts of crypto from a wallet address that looks very similar to one you've transacted with before. They hope you'll accidentally copy their address from your transaction history for a future, larger transaction. AlgoLink's AI feature helps detect such discrepancies."
          />
          <FaqItem
            question="How does the suspicious address detection work?"
            answer="Our AI analyzes the wallet address you provide, compares it with any expected address patterns you might have (if you've used similar ones before or provided an expected format), and your transaction history (if available and consented) to flag potential 'poisoned' or mistyped addresses, suggesting a more likely correct one."
          />
        </div>
      </section>

      {/* CTA Section */}
      <Card className="rounded-xl bg-gradient-to-r from-primary to-accent text-center shadow-xl">
        <CardHeader className="pt-8 md:pt-12">
          <CardTitle className="text-3xl font-bold text-primary-foreground">Ready to Secure and Simplify Your Algorand Experience?</CardTitle>
        </CardHeader>
        <CardContent className="px-8 md:px-12">
          <p className="mb-8 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Join AlgoLink today to easily manage your wallet identities, enhance your security with AI-powered checks, and control your on-chain privacy.
          </p>
        </CardContent>
        <CardFooter className="pb-8 md:pb-12 flex justify-center">
          <Button size="lg" variant="secondary" className="text-base py-3 px-8" asChild>
            <Link href="/linkWallet">
               <span className="flex items-center">Link Your First Wallet <Rocket className="ml-2 h-5 w-5" /></span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
