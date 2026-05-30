"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingBag,
  LayoutDashboard,
  FileText,
  HelpCircle,
  Menu,
  X,
  User,
  Globe,
  WifiOff,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  Briefcase,
  Sprout,
  BookOpen,
  Video,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languages, userRoles } from '@/lib/design-tokens';
import { t } from '@/lib/i18n';
import { useLanguage, Language } from '@/lib/hooks/useLanguage';
import { useAuth } from '@/lib/hooks/useAuth';
import { NotificationPanel } from '@/components/NotificationPanel';

interface NavigationProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
  isOffline?: boolean;
}

export function Navigation({ currentRole = 'farmer', onRoleChange, isOffline = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language: currentLang, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Determine actual role from user if authenticated
  const effectiveRole = isAuthenticated && user?.roles?.[0] ? user.roles[0] : currentRole;

  // Get user display name
  const displayName = user?.name || 'User';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getNavItems = () => {
    // Guest Navigation
    if (!isAuthenticated) {
      return [
        { href: '/', label: t('nav.home', currentLang), icon: Home },
        { href: '/advisory', label: currentLang === 'hi' ? 'कृषि सलाह' : 'Advisory', icon: BookOpen },
        { href: '/calculator', label: currentLang === 'hi' ? 'कृषि धन' : 'Krishi Dhan', icon: Calculator },
        { href: '/why-shree-anna', label: t('nav.whyShreeAnna', currentLang), icon: Sprout },
        { href: '/schemes', label: t('nav.schemes', currentLang), icon: FileText },
        { href: '/help', label: t('nav.help', currentLang), icon: HelpCircle },
      ];
    }

    // Authenticated Navigation
    const items = [
      { href: `/${effectiveRole}/dashboard`, label: t('nav.dashboard', currentLang), icon: LayoutDashboard },
    ];

    // Navigation for Marketplace
    if (effectiveRole === 'processor') {
      items.push({ href: '/processor/marketplace', label: t('nav.marketplace', currentLang), icon: ShoppingBag });
    } else if (effectiveRole !== 'farmer') {
      // Buyers and others go to general marketplace
      items.push({ href: '/marketplace', label: t('nav.marketplace', currentLang), icon: ShoppingBag });
    }

    // Add common authenticated items
    items.push(
      { href: '/advisory', label: currentLang === 'hi' ? 'कृषि सलाह' : 'Advisory', icon: BookOpen },
      { href: '/calculator', label: currentLang === 'hi' ? 'कृषि धन' : 'Krishi Dhan', icon: Calculator },
      { href: '/why-shree-anna', label: t('nav.whyShreeAnna', currentLang), icon: Sprout },
      { href: '/schemes', label: t('nav.schemes', currentLang), icon: FileText },
      { href: '/help', label: t('nav.help', currentLang), icon: HelpCircle }
    );

    return items;
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticated ? `/${effectiveRole}/dashboard` : "/"} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <img src="/lgo.png" alt="Shree Anna" className="w-8 h-8 object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-foreground">Shree Anna</span>
              <span className="block text-xs text-muted-foreground">Millets Marketplace</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 mx-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Kisan Setu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Sprout className="w-4 h-4" />
                  किसान सेतु
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/krishi-darpan" className="w-full cursor-pointer">
                    <Video className="w-4 h-4 mr-2" />
                    कृषि दर्पण
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/krishi-darpan/pathshala" className="w-full cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    कृषि पाठशाला
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Offline indicator */}
            {isOffline && (
              <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs offline-pulse">
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Notification Panel */}
            <NotificationPanel />

            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{languages.find(l => l.code === currentLang)?.nativeName}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as Language)}
                    className={currentLang === lang.code ? 'bg-primary/10' : ''}
                  >
                    {lang.nativeName} ({lang.name})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Show role selector ONLY when NOT authenticated */}
            {!isAuthenticated && !isLoading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span>{userRoles[currentRole as keyof typeof userRoles]?.icon}</span>
                    <span className="hidden sm:inline">
                      {userRoles[currentRole as keyof typeof userRoles]?.name}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.values(userRoles).map((role) => (
                    <DropdownMenuItem
                      key={role.id}
                      onClick={() => onRoleChange?.(role.id)}
                      className={currentRole === role.id ? 'bg-primary/10' : ''}
                    >
                      <span className="mr-2">{role.icon}</span>
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu (when authenticated) OR Login button (when not) */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {effectiveRole === 'farmer' ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20">
                        <img
                          src="/farmer-profile.jpeg"
                          alt="Farmer Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {userInitials}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-24 truncate">{displayName}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* User info header */}
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-sm">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                        {userRoles[effectiveRole as keyof typeof userRoles]?.icon} {effectiveRole}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push(`/${effectiveRole}/dashboard`)} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isLoading ? (
              <Link href="/login">
                <Button size="sm" className="hidden sm:flex">
                  <User className="w-4 h-4 mr-2" />
                  {t('nav.login', currentLang)}
                </Button>
              </Link>
            ) : null}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {/* User info for mobile (when authenticated) */}
              {isAuthenticated && user && (
                <div className="px-4 py-3 bg-muted/50 rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    {effectiveRole === 'farmer' ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
                        <img
                          src="/farmer-profile.jpeg"
                          alt="Farmer Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                        {userInitials}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors touch-target
                      ${isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Kisan Setu Section for Mobile */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {currentLang === 'hi' ? 'किसान सेतु' : 'Kisan Setu'}
              </div>
              <Link
                href="/krishi-darpan"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted touch-target"
              >
                <Video className="w-5 h-5" />
                {currentLang === 'hi' ? 'कृषि दर्पण' : 'Krishi Darpan'}
              </Link>
              <Link
                href="/krishi-darpan/pathshala"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted touch-target"
              >
                <BookOpen className="w-5 h-5" />
                {currentLang === 'hi' ? 'कृषि पाठशाला' : 'Krishi Pathshala'}
              </Link>

              <div className="h-px bg-border my-2" />

              {/* Mobile user menu options */}
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted touch-target w-full text-left"
                  >
                    <UserCircle className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted touch-target w-full text-left"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 touch-target w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full touch-target">
                    <User className="w-5 h-5 mr-2" />
                    {t('nav.login', currentLang)}
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
