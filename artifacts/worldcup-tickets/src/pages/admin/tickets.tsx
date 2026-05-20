import { AdminLayout } from './dashboard';
import { useListMatches, useListMatchTickets, useUpdateTicket } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminTickets() {
  const { data: matches, isLoading: matchesLoading } = useListMatches();
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  
  const { data: tickets, isLoading: ticketsLoading } = useListMatchTickets(selectedMatch || 0, {
    query: { enabled: !!selectedMatch, queryKey: ['/api/matches', selectedMatch, 'tickets'] }
  });

  const updateMutation = useUpdateTicket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateStatus = (id: number, status: 'available' | 'reserved' | 'sold') => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Ticket status updated' });
        queryClient.invalidateQueries({ queryKey: ['/api/matches', selectedMatch, 'tickets'] });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Tickets</h1>
          <p className="text-slate-500">Manage ticket inventory and status</p>
        </div>
        <div className="w-full md:w-72">
          <Select onValueChange={(val) => setSelectedMatch(parseInt(val, 10))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a match to view tickets" />
            </SelectTrigger>
            <SelectContent>
              {matches?.map(match => (
                <SelectItem key={match.id} value={match.id.toString()}>
                  {match.homeTeam} vs {match.awayTeam} ({match.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedMatch ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
          Please select a match to view its tickets
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                <TableHead>Seat</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Row</TableHead>
                <TableHead>Category (EN)</TableHead>
                <TableHead>Category (AR)</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketsLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ) : tickets?.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-bold">{ticket.seatNumber}</TableCell>
                  <TableCell>{ticket.section}</TableCell>
                  <TableCell>{ticket.row}</TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>{ticket.categoryAr}</TableCell>
                  <TableCell>${ticket.price}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ticket.status === 'available' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Select onValueChange={(val: 'available' | 'reserved' | 'sold') => handleUpdateStatus(ticket.id, val)} value={ticket.status}>
                      <SelectTrigger className="w-[120px] ml-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {tickets?.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-500">No tickets found for this match</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
