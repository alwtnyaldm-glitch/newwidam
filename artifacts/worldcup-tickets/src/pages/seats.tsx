import { useState, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetMatch, getGetMatchQueryKey, useListMatchTickets, getListMatchTicketsQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Seats() {
  const [, params] = useRoute('/matches/:id/seats');
  const id = parseInt(params?.id || '0', 10);
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  
  const { data: match, isLoading: matchLoading } = useGetMatch(id, {
    query: { enabled: !!id, queryKey: getGetMatchQueryKey(id) }
  });

  const { data: tickets, isLoading: ticketsLoading } = useListMatchTickets(id, {
    query: { enabled: !!id, queryKey: getListMatchTicketsQueryKey(id) }
  });

  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

  const handleSeatClick = (ticketId: number, status: string) => {
    if (status !== 'available') return;
    
    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        if (next.size >= 10) return prev; // max 10 tickets
        next.add(ticketId);
      }
      return next;
    });
  };

  const selectedTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(t => selectedSeatIds.has(t.id));
  }, [tickets, selectedSeatIds]);

  const totalPrice = useMemo(() => {
    return selectedTickets.reduce((sum, ticket) => sum + ticket.price, 0);
  }, [selectedTickets]);

  const handleContinue = () => {
    if (selectedSeatIds.size === 0) return;
    // Save to local storage for checkout flow
    localStorage.setItem(`selected_seats_${id}`, JSON.stringify(selectedTickets));
    setLocation(`/book/${id}`);
  };

  if (matchLoading || ticketsLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[600px] w-full" /></div>;
  }

  if (!match || !tickets) {
    return <div className="text-center py-20">{t('Not found', 'غير موجود')}</div>;
  }

  // Group tickets by section for grid display
  const sections = ['A', 'B', 'C', 'D'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'ar' ? `${match.homeTeamAr} ضد ${match.awayTeamAr}` : `${match.homeTeam} vs ${match.awayTeam}`}
        </h1>
        <p className="text-muted-foreground">{t('Select your seats', 'اختر مقاعدك')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Pitch placeholder */}
            <div className="h-32 bg-primary/5 border border-primary/20 rounded-xl mb-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-20 h-20 border-2 border-primary/20 rounded-full" />
              <div className="absolute w-1 h-full bg-primary/20" />
              <span className="text-primary/40 font-bold uppercase tracking-widest">{t('PITCH', 'الملعب')}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-16">
              {sections.map(section => (
                <div key={section} className="flex flex-col items-center">
                  <h3 className="font-bold text-muted-foreground mb-4 text-center">{t('Section', 'القسم')} {section}</h3>
                  <div className="flex flex-col gap-2">
                    {/* Render rows 1-5 */}
                    {[1, 2, 3, 4, 5].map(rowNum => {
                      const rowTickets = tickets.filter(t => t.section === section && (t.row === `Row ${rowNum}` || t.row === rowNum.toString()));
                      if (rowTickets.length === 0) return null;
                      
                      return (
                        <div key={rowNum} className="flex gap-2 justify-center">
                          <div className="w-4 flex items-center text-xs text-muted-foreground">{rowNum}</div>
                          {rowTickets.map(ticket => {
                            const isSelected = selectedSeatIds.has(ticket.id);
                            const isAvailable = ticket.status === 'available';
                            
                            let seatClass = "w-8 h-8 rounded-t-lg rounded-b-sm border transition-all cursor-pointer flex items-center justify-center text-xs font-medium ";
                            
                            if (isSelected) {
                              seatClass += "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(212,175,55,0.5)] transform -translate-y-1";
                            } else if (isAvailable) {
                              seatClass += "bg-green-950/40 border-green-500/30 text-green-500 hover:bg-green-900/60 hover:border-green-400";
                            } else {
                              seatClass += "bg-muted/30 border-border text-muted-foreground/30 cursor-not-allowed";
                            }

                            return (
                              <button
                                key={ticket.id}
                                disabled={!isAvailable && !isSelected}
                                className={seatClass}
                                onClick={() => handleSeatClick(ticket.id, ticket.status)}
                                title={`Seat ${ticket.seatNumber} - $${ticket.price}`}
                              >
                                {ticket.seatNumber}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded bg-green-950/40 border border-green-500/30" />
                <span>{t('Available', 'متاح')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded bg-primary border border-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                <span className="text-foreground">{t('Selected', 'محدد')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded bg-muted/30 border border-border" />
                <span>{t('Reserved', 'محجوز')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">{t('Your Selection', 'اختيارك')}</h3>
            
            <ScrollArea className="h-[200px] mb-6">
              {selectedTickets.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t('No seats selected', 'لم يتم تحديد مقاعد')}
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {selectedTickets.map(ticket => (
                    <div key={ticket.id} className="flex justify-between items-center bg-background/50 border border-border p-3 rounded-lg">
                      <div>
                        <div className="font-bold">{t('Seat', 'مقعد')} {ticket.seatNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          Sec {ticket.section}, Row {ticket.row} • {language === 'ar' ? ticket.categoryAr : ticket.category}
                        </div>
                      </div>
                      <div className="font-bold text-primary">${ticket.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-center text-lg mb-2">
                <span className="text-muted-foreground">{t('Total Tickets', 'إجمالي التذاكر')}</span>
                <span className="font-bold">{selectedTickets.length}</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold">{t('Total Price', 'السعر الإجمالي')}</span>
                <span className="font-bold text-primary text-2xl">${totalPrice}</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg font-bold" 
              disabled={selectedTickets.length === 0}
              onClick={handleContinue}
            >
              {t('Continue to Details', 'المتابعة للتفاصيل')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
