import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Film,
  Sparkles,
  Utensils,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  Clock,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function RootLayout() {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, role, signOut } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies', icon: Film, accent: 'text-indigo-400' },
    { name: 'Live Shows', path: '/shows', icon: Sparkles, accent: 'text-amber-400' },
    { name: 'Dining', path: '/restaurant', icon: Utensils, accent: 'text-rose-400' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full glass-header">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-sm shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                KK
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground leading-none">
                  Kai Koi
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  Entertainment Hub
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {Icon && <Icon className={cn('h-3.5 w-3.5', link.accent)} />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
              title="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Session or Sign In */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                {(role === 'ADMIN' || role === 'STAFF') && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Link to="/admin">
                      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                      Admin
                    </Link>
                  </Button>
                )}

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/50 text-xs">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-medium max-w-[110px] truncate">{user.fullName || user.email}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                    {role}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="rounded-lg h-9 w-9 text-muted-foreground hover:text-rose-500"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm hover:from-indigo-600 hover:to-indigo-700">
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg h-9 w-9"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 transition-all animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    {Icon && <Icon className={cn('h-4 w-4', link.accent)} />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border/40 flex flex-col space-y-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-medium">{user.fullName || user.email}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {role}
                    </span>
                  </div>

                  {(role === 'ADMIN' || role === 'STAFF') && (
                    <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Link to="/admin" onClick={closeMobileMenu}>
                        <ShieldAlert className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="w-full justify-start gap-2 text-rose-500 hover:text-rose-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild size="sm" className="w-full bg-indigo-600 text-white">
                  <Link to="/login" onClick={closeMobileMenu}>Sign In to Kai Koi</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Routed Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Structured Footer */}
      <footer className="border-t border-border/40 bg-card/40 backdrop-blur-xs text-xs text-muted-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                KK
              </span>
              <span className="font-bold text-sm text-foreground">Kai Koi</span>
            </div>
            <p className="text-xs leading-relaxed">
              A single entertainment building housing cinema screens, live auditorium theater, and rooftop dining under one unified booking engine.
            </p>
          </div>

          {/* Quick Verticals */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Experiences</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/movies" className="hover:text-foreground transition-colors">Movie Theater (IMAX & 2D)</Link>
              </li>
              <li>
                <Link to="/shows" className="hover:text-foreground transition-colors">Live Theater & Concerts</Link>
              </li>
              <li>
                <Link to="/restaurant" className="hover:text-foreground transition-colors">Rooftop Restaurant & Dining</Link>
              </li>
            </ul>
          </div>

          {/* Location & Policies */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Venue Info</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Kai Koi Complex, India</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Timezone: Asia/Kolkata (IST)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Currency: INR (₹)</span>
              </li>
            </ul>
          </div>

          {/* System Notice */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Booking System</h4>
            <p className="text-xs leading-relaxed">
              Payments processed securely in <strong>Razorpay Test Mode</strong>. No real currency is charged during preview.
            </p>
            <div className="mt-3 inline-block px-2.5 py-1 rounded bg-muted text-[11px] font-mono">
              v0.1.0 (Phase F1)
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 py-4 text-center">
          © 2026 Kai Koi Entertainment. Built to Specification §12.
        </div>
      </footer>
    </div>
  );
}
