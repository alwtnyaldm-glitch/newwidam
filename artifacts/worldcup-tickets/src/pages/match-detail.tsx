import { useRoute } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetMatch, getGetMatchQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { format } from 'date-fns';

export default function MatchDetail() {
  const [, params] = useRoute('/matches/:id');
  const id = parseInt(params?.id || '0', 10);
  const { t, language } = useLanguage();
  
  const { data: match, isLoading } = useGetMatch(id, {
    query: { enabled: !!id, queryKey: getGetMatchQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="w-full h-[400px] rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[200px] col-span-2 rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
        {t('Match not found', 'المباراة غير موجودة')}
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[50vh] min-h-[400px] bg-muted overflow-hidden flex items-end">
        <img 
          src={match.image || '/match-bg.png'} 
          alt="Stadium" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="container relative z-10 mx-auto px-4 pb-12">
          <div className="inline-block bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm font-bold mb-4 backdrop-blur-sm">
            {language === 'ar' ? match.stageAr : match.stage}
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-6xl mb-2 drop-shadow-lg">{match.homeTeamFlag}</div>
                <h1 className="text-3xl font-bold">{language === 'ar' ? match.homeTeamAr : match.homeTeam}</h1>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="text-6xl mb-2 drop-shadow-lg">{match.awayTeamFlag}</div>
                <h1 className="text-3xl font-bold">{language === 'ar' ? match.awayTeamAr : match.awayTeam}</h1>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-xl font-medium mb-1">
                {format(new Date(match.matchDate), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-muted-foreground">
                {format(new Date(match.matchDate), 'HH:mm')} Local Time
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary border-b border-border pb-2 inline-block">
                {t('Match Information', 'معلومات المباراة')}
              </h2>
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 text-center text-xl">📍</div>
                  <div>
                    <div className="font-bold text-lg">{language === 'ar' ? match.stadiumAr : match.stadium}</div>
                    <div className="text-muted-foreground">{language === 'ar' ? match.cityAr : match.city}</div>
                  </div>
                </div>
                {match.description && (
                  <div className="pt-4 mt-4 border-t border-border">
                    <p className="leading-relaxed">
                      {language === 'ar' ? match.descriptionAr : match.description}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-primary/30 rounded-xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
              <h3 className="text-xl font-bold mb-2">{t('Tickets Available', 'التذاكر المتاحة')}</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {t('Select your seats from the interactive map.', 'اختر مقاعدك من الخريطة التفاعلية.')}
              </p>
              
              <div className="flex items-end justify-between mb-8 pb-6 border-b border-border">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{t('Starting from', 'تبدأ من')}</div>
                  <div className="text-4xl font-bold text-primary">${match.minPrice}</div>
                </div>
              </div>
              
              <Link href={`/matches/${match.id}/seats`}>
                <Button size="lg" className="w-full text-lg font-bold">
                  {t('Select Seats', 'اختيار المقاعد')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
