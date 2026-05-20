import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from './dashboard';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      localStorage.removeItem('admin_token');
      toast({ title: 'Success', description: 'Password changed. Please log in again.' });
      window.location.href = '/admin/login';
    } catch (error) {
      toast({ title: 'Error', description: 'Unable to change password', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAll = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      await fetch('/api/admin/logout-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('admin_token');
      toast({ title: 'Success', description: 'All devices have been logged out.' });
      window.location.href = '/admin/login';
    } catch (error) {
      toast({ title: 'Error', description: 'Unable to log out all devices', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Change admin password and terminate active admin sessions.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting}>Change Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>Session Control</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">Use this button to log out admin access from all other devices and browsers.</p>
          <Button variant="destructive" onClick={handleLogoutAll}>Log out all devices</Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
