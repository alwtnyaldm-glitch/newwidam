import React from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function Layout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">
              Eid Gifts
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted'}`}>
              {t('Home', 'الرئيسية')}
            </Link>
            <Link href="/matches" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/matches') ? 'text-primary' : 'text-muted'}`}>
              {t('Products', 'المنتجات')}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="font-bold"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted">
          <p className="text-sm">
            {t('© 2026 Premium Ticketing. Not affiliated with FIFA.', '© 2026 التذاكر المميزة. غير تابع للفيفا.')}
          </p>
        </div>
      </footer>
    </div>
  );
}
