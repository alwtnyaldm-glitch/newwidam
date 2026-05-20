import { AdminLayout } from './dashboard';
import { useListPosts, useDeletePost, useCreatePost, useUpdatePost } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Post } from '@workspace/api-client-react';

const postSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  content: z.string().min(1),
  contentAr: z.string().min(1),
  image: z.string().optional(),
  isPublished: z.boolean().default(true),
});

export default function AdminPosts() {
  const { data: posts, isLoading } = useListPosts();
  const deleteMutation = useDeletePost();
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: '', titleAr: '', content: '', contentAr: '', image: '', isPublished: true }
  });

  const openCreate = () => {
    setEditingPost(null);
    form.reset({ title: '', titleAr: '', content: '', contentAr: '', image: '', isPublished: true });
    setIsDialogOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditingPost(post);
    form.reset({
      title: post.title, titleAr: post.titleAr,
      content: post.content, contentAr: post.contentAr,
      image: post.image || '', isPublished: post.isPublished
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof postSchema>) => {
    const action = editingPost
      ? updateMutation.mutateAsync({ id: editingPost.id, data: values })
      : createMutation.mutateAsync({ data: values });

    action.then(() => {
      toast({ title: 'Success', description: `Post ${editingPost ? 'updated' : 'created'}` });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setIsDialogOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Post deleted' });
          queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">News & Posts</h1>
          <p className="text-slate-500">Manage announcements and articles</p>
        </div>
        <Button onClick={openCreate}>Create Post</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
              <TableHead>ID</TableHead>
              <TableHead>Title (EN)</TableHead>
              <TableHead>Title (AR)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : posts?.map(post => (
              <TableRow key={post.id}>
                <TableCell>{post.id}</TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.titleAr}</TableCell>
                <TableCell>{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => openEdit(post)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="titleAr" render={({ field }) => (
                <FormItem><FormLabel>Title (AR)</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem><FormLabel>Content (EN)</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="contentAr" render={({ field }) => (
                <FormItem><FormLabel>Content (AR)</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} dir="rtl" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="isPublished" render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-4">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="!mt-0">Is Published</FormLabel>
                </FormItem>
              )} />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
