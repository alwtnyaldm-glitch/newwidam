import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function validate() {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsChecking(false);
        setLocation('/admin/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/validate', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem('admin_token');
          setIsChecking(false);
          setLocation('/admin/login');
          return;
        }
      } catch {
        localStorage.removeItem('admin_token');
        setIsChecking(false);
        setLocation('/admin/login');
        return;
      }

      setIsChecking(false);
    }

    if (!location.startsWith('/admin/login')) {
      validate();
    } else {
      setIsChecking(false);
    }
  }, [location, setLocation]);

  if (isChecking) {
    return <div className="h-screen w-full flex items-center justify-center"><Skeleton className="h-32 w-32 rounded-full" /></div>;
  }

  return <>{children}</>;
}
