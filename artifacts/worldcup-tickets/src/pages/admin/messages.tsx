import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from './dashboard';

interface MessageItem {
  id: number;
  title: string;
  content: string;
  targetUserId: number | null;
  targetVisitorId: number | null;
  isGlobal: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({ title: '', content: '', targetType: 'global', targetId: '' });

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: any = {
      title: formState.title,
      content: formState.content,
      isGlobal: formState.targetType === 'global',
    };

    if (formState.targetType === 'user') {
      payload.targetUserId = Number(formState.targetId) || null;
    }

    if (formState.targetType === 'visitor') {
      payload.targetVisitorId = Number(formState.targetId) || null;
    }

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setFormState({ title: '', content: '', targetType: 'global', targetId: '' });
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (message: MessageItem) => {
    try {
      await fetch(`/api/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !message.isActive }),
      });
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const removeMessage = async (message: MessageItem) => {
    try {
      await fetch(`/api/messages/${message.id}`, { method: 'DELETE' });
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-slate-500 dark:text-slate-400">Send announcements or targeted popups to visitors and users.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea value={formState.content} onChange={(e) => setFormState({ ...formState, content: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target</label>
              <select className="w-full rounded-lg border border-slate-300 bg-background p-3" value={formState.targetType} onChange={(e) => setFormState({ ...formState, targetType: e.target.value, targetId: '' })}>
                <option value="global">Global</option>
                <option value="user">User</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
            {(formState.targetType === 'user' || formState.targetType === 'visitor') && (
              <div>
                <label className="block text-sm font-medium mb-1">Target ID</label>
                <Input value={formState.targetId} onChange={(e) => setFormState({ ...formState, targetId: e.target.value })} placeholder="Enter user or visitor ID" required />
              </div>
            )}
            <Button type="submit" size="lg">Send Message</Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((idx) => <Skeleton key={idx} className="h-48 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((message) => (
            <Card key={message.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{message.title}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${message.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.isActive ? 'Active' : 'Inactive'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <div>{message.content}</div>
                  <div><strong>Target:</strong> {message.isGlobal ? 'Global' : message.targetUserId ? `User ${message.targetUserId}` : `Visitor ${message.targetVisitorId}`}</div>
                  <div><strong>Created:</strong> {new Date(message.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(message)}>
                    {message.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeMessage(message)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
