// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import navLogo from '@/app/assets/nav-logo-distorted.png';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { LogInIcon, LogOutIcon, RocketIcon, LayoutDashboardIcon, SettingsIcon, LinkIcon as LinkIconLucide, BookOpen, SearchIcon, Compass, HomeIcon, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutUser, getCurrentUser } from '@/app/actions/authActions';
import { useEffect, useState, FormEvent } from 'react';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import type { Notification } from '@/components/notifications/NotificationItem';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} from '@/app/actions/notificationActions';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { SessionPayload } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  authRequired?: boolean;
  publicOnly?: boolean;
  alwaysVisible?: boolean;
  hideWhenLoggedIn?: boolean;
}

const navItemsBase: NavItem[] = [
  { href: '/onboarding', label: 'Get Started', icon: RocketIcon, hideWhenLoggedIn: true },
  { href: '/explorer', label: 'Explorer', icon: Compass, alwaysVisible: true },
  { href: '/docs', label: 'Docs', icon: BookOpen, alwaysVisible: true },
  { href: '/auth/authenticate', label: 'Login / Sign Up', icon: LogInIcon, publicOnly: true },
  { href: '/linkWallet', label: 'Link Wallet', icon: LinkIconLucide, authRequired: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, authRequired: true },
  { href: '/settings', label: 'Settings', icon: SettingsIcon, authRequired: true },
];

function getUserInitials(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    const names = displayName.split(' ').filter(Boolean);
    if (names.length > 1 && names[0] && names[1]) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    if (names[0] && names[0].length > 1) {
      return (names[0][0] + names[0][1]).toUpperCase();
    }
    if (names[0]) {
      return names[0][0].toUpperCase();
    }
  }
  if (email) {
    const emailPrefix = email.split('@')[0];
    if (emailPrefix && emailPrefix.length > 1) {
      return (emailPrefix[0] + emailPrefix[1]).toUpperCase();
    }
    if (emailPrefix && emailPrefix.length === 1) {
      return emailPrefix[0].toUpperCase();
    }
  }
  return '??';
}




export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<(Omit<SessionPayload, 'expiresAt' | 'isVerified'> & { isVerified: boolean; displayName: string | null; avatarUrl: string | null; }) | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkOneAsRead = async (id: string) => {
    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };
  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };
  const handleClearAll = async () => {
    const result = await clearAllNotifications();
    if (result.success) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          setLoadingNotifications(true);
          const liveNotifications = await getNotifications();
          setNotifications(liveNotifications);
          setLoadingNotifications(false);
        } else {
          setNotifications([]);
        }
      } catch (e) {
        console.error("Failed to fetch current user or notifications for header", e);
        setCurrentUser(null);
        setNotifications([]);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setNotifications([]);
  };

  const handleHeaderSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = headerSearchQuery.trim();
    if (trimmedQuery) {
      router.push(`/explorer?query=${encodeURIComponent(trimmedQuery)}`);
      setHeaderSearchQuery(''); // Clear search input after submission
    }
  };

  const visibleNavItems = navItemsBase.filter(item => {
    if (item.alwaysVisible) return true;
    if (item.hideWhenLoggedIn && currentUser) return false;
    if (item.authRequired) return !!currentUser;
    if (item.publicOnly) return !currentUser;
    return true;
  });

  return (
    <header className="sticky top-4 z-50 mx-3 sm:mx-6 lg:mx-auto lg:max-w-[95%] bg-background/40 backdrop-blur-xl border border-white/15 rounded-2xl shadow-lg shadow-black/5 glass-glow transition-all duration-300">
      <div className="px-2 sm:px-6">
        <div className="flex items-center justify-between h-13 sm:h-14">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src={navLogo}
              alt="Algolink"
              height={28}
              className="w-auto"
              priority
            />
          </Link>

          {pathname === '/' && !currentUser && (
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search Address, TxID, Asset ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border-border focus:ring-primary focus:border-primary h-10 text-sm"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                />
              </form>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-3">
            {loadingUser && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full hidden sm:block" />
                <Skeleton className="h-8 w-8 rounded-full ml-1 sm:ml-2" />
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            )}
            {!loadingUser && (
              <>
                <NavigationMenu>
                  <NavigationMenuList>
                    {visibleNavItems.map((item) => {
                      const Icon = item.icon;
                      const href = item.href;
                      return (
                        <NavigationMenuItem key={item.href}>
                          <NavigationMenuLink
                            asChild
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "text-xs sm:text-sm font-medium px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2 rounded-full h-8 sm:h-9",
                              pathname === item.href ? "bg-primary/15 text-primary hover:bg-primary/20" : "text-foreground/70 hover:text-foreground hover:bg-white/10"
                            )}
                          >
                            <Link href={href}>
                              <Icon className="h-4 w-4" />
                              <span className="hidden md:inline">{item.label}</span>
                            </Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      );
                    })}
                  </NavigationMenuList>
                </NavigationMenu>

                {currentUser ? (
                  <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative text-foreground/70 hover:text-foreground hover:bg-accent/10 rounded-full p-1.5 sm:p-2"
                          aria-label="Open notifications"
                        >
                          <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                          {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-red-500 items-center justify-center text-white text-[8px] sm:text-[9px]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            </span>
                          )}
                        </Button>
                      </DialogTrigger>
                      <NotificationPanel
                        notifications={notifications}
                        onMarkOneAsRead={handleMarkOneAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onClearAll={handleClearAll}
                        unreadCount={unreadCount}
                      />
                    </Dialog>

                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                      {currentUser.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName || currentUser.email || 'User Avatar'} />}
                      <AvatarFallback>{getUserInitials(currentUser.displayName, currentUser.email)}</AvatarFallback>
                    </Avatar>
                    <form action={handleLogout}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-xs sm:text-sm font-medium px-2 py-1 sm:px-3 text-foreground/70 hover:text-foreground hover:bg-accent/10 rounded-full h-9 sm:h-10"
                      >
                        <LogOutIcon className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Logout</span>
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="ml-1 sm:ml-2">
                    {/* Placeholder for non-logged-in user actions or empty space */}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
