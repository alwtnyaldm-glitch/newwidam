import { AdminLayout } from './dashboard';
import { useListMatches, useDeleteMatch, useCreateMatch, useUpdateMatch } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import type { Match } from '@workspace/api-client-react';

const matchSchema = z.object({
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  homeTeamAr: z.string().min(1),
  awayTeamAr: z.string().min(1),
  homeTeamFlag: z.string().optional(),
  awayTeamFlag: z.string().optional(),
  stadium: z.string().min(1),
  stadiumAr: z.string().min(1),
  city: z.string().min(1),
  cityAr: z.string().min(1),
  matchDate: z.string().min(1),
  stage: z.string().min(1),
  stageAr: z.string().min(1),
  minPrice: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
});

export default function AdminMatches() {
  const { data: matches, isLoading } = useListMatches();
  const deleteMutation = useDeleteMatch();
  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      homeTeam: '', awayTeam: '', homeTeamAr: '', awayTeamAr: '',
      homeTeamFlag: '', awayTeamFlag: '', stadium: '', stadiumAr: '',
      city: '', cityAr: '', matchDate: '', stage: '', stageAr: '',
      minPrice: 0, isActive: true
    }
  });

  const openCreate = () => {
    setEditingMatch(null);
    form.reset({
      homeTeam: '', awayTeam: '', homeTeamAr: '', awayTeamAr: '',
      homeTeamFlag: '', awayTeamFlag: '', stadium: '', stadiumAr: '',
      city: '', cityAr: '', matchDate: new Date().toISOString().slice(0, 16),
      stage: '', stageAr: '', minPrice: 0, isActive: true
    });
    setIsDialogOpen(true);
  };

  const openEdit = (match: Match) => {
    setEditingMatch(match);
    form.reset({
      homeTeam: match.homeTeam, awayTeam: match.awayTeam,
      homeTeamAr: match.homeTeamAr, awayTeamAr: match.awayTeamAr,
      homeTeamFlag: match.homeTeamFlag || '', awayTeamFlag: match.awayTeamFlag || '',
      stadium: match.stadium, stadiumAr: match.stadiumAr,
      city: match.city, cityAr: match.cityAr,
      matchDate: match.matchDate.slice(0, 16),
      stage: match.stage, stageAr: match.stageAr,
      minPrice: match.minPrice, isActive: match.isActive
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof matchSchema>) => {
    const action = editingMatch
      ? updateMutation.mutateAsync({ id: editingMatch.id, data: values })
      : createMutation.mutateAsync({ data: values });

    action.then(() => {
      toast({ title: 'Success', description: `Match ${editingMatch ? 'updated' : 'created'}` });
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      setIsDialogOpen(false);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this match?')) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Match deleted' });
          queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Matches</h1>
          <p className="text-slate-500">Manage all tournament matches</p>
        </div>
        <Button onClick={openCreate}>Add Match</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
              <TableHead>ID</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Min Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : matches?.map(match => (
              <TableRow key={match.id}>
                <TableCell>{match.id}</TableCell>
                <TableCell className="font-medium">
                  {match.homeTeamFlag} {match.homeTeam} vs {match.awayTeamFlag} {match.awayTeam}
                </TableCell>
                <TableCell>{format(new Date(match.matchDate), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell>{match.stadium}, {match.city}</TableCell>
                <TableCell>{match.stage}</TableCell>
                <TableCell>${match.minPrice}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${match.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {match.isActive ? 'Active' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => openEdit(match)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(match.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMatch ? 'Edit Match' : 'Create Match'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="homeTeam" render={({ field }) => (
                  <FormItem><FormLabel>Home Team (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="homeTeamAr" render={({ field }) => (
                  <FormItem><FormLabel>Home Team (AR)</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="awayTeam" render={({ field }) => (
                  <FormItem><FormLabel>Away Team (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="awayTeamAr" render={({ field }) => (
                  <FormItem><FormLabel>Away Team (AR)</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="stadium" render={({ field }) => (
                  <FormItem><FormLabel>Stadium (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="stadiumAr" render={({ field }) => (
                  <FormItem><FormLabel>Stadium (AR)</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="cityAr" render={({ field }) => (
                  <FormItem><FormLabel>City (AR)</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="stage" render={({ field }) => (
                  <FormItem><FormLabel>Stage (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="stageAr" render={({ field }) => (
                  <FormItem><FormLabel>Stage (AR)</FormLabel><FormControl><Input {...field} dir="rtl" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="matchDate" render={({ field }) => (
                  <FormItem><FormLabel>Match Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="minPrice" render={({ field }) => (
                  <FormItem><FormLabel>Min Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="homeTeamFlag" render={({ field }) => (
                  <FormItem><FormLabel>Home Flag Emoji</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="awayTeamFlag" render={({ field }) => (
                  <FormItem><FormLabel>Away Flag Emoji</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 mt-8">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Is Active</FormLabel>
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingMatch ? 'Update Match' : 'Create Match'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
