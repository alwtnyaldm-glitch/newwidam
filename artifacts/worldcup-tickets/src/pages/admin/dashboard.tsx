import { useGetStatsSummary, useGetRecentOrders } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Ticket, Trophy, FileText, ShoppingCart, LogOut, Package, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const logout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-lg font-bold tracking-tight text-primary">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <Package className="mr-2 h-4 w-4" /> Products
            </Button>
          </Link>
          <Link href="/admin/edetor">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <Edit3 className="mr-2 h-4 w-4" /> Editor
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <Ticket className="mr-2 h-4 w-4" /> Users
            </Button>
          </Link>
          <Link href="/admin/visitors">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <Trophy className="mr-2 h-4 w-4" /> Visitors
            </Button>
          </Link>
          <Link href="/admin/messages">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <FileText className="mr-2 h-4 w-4" /> Messages
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <LogOut className="mr-2 h-4 w-4" /> Settings
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <ShoppingCart className="mr-2 h-4 w-4" /> Orders
            </Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="ghost" className="w-full justify-start text-left font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
              <FileText className="mr-2 h-4 w-4" /> News/Posts
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsSummary();
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening today.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Confirmed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.confirmedOrders}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.pendingOrders} pending</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.totalMatches}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.availableTickets}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders?.map(order => (
                  <TableRow key={order.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.matchName || `Match ${order.matchId}`}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-bold">${order.totalPrice}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.paymentStatus === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">No recent orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
