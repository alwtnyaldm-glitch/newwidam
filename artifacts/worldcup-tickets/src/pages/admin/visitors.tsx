import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from './dashboard';

interface VisitorItem {
  id: number;
  sessionId: string;
  name: string | null;
  userId: number | null;
  lastVisit: string;
  visitCount: number;
  isOnline: boolean;
}

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/visitors');
      const data = await response.json();
      setVisitors(data.visitors || data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Visitors</h1>
        <p className="text-slate-500 dark:text-slate-400">Track visitors by name or show "زائر جديد" for anonymous sessions.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <Skeleton key={idx} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visitors.map((visitor) => (
            <Card key={visitor.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle>{visitor.name || 'زائر جديد'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <div><span className="font-medium">Session:</span> {visitor.sessionId}</div>
                  <div><span className="font-medium">Visits:</span> {visitor.visitCount}</div>
                  <div><span className="font-medium">Last seen:</span> {new Date(visitor.lastVisit).toLocaleString()}</div>
                  <div><span className="font-medium">Status:</span> {visitor.isOnline ? 'Online' : 'Offline'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
