import { useLanguage } from '@/lib/i18n';
import { useListMatches } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Matches() {
  const { t, language } = useLanguage();
  const { data: matches, isLoading } = useListMatches();
  const matchesArray = Array.isArray(matches) ? matches : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4">{t('Eid Gift Products', 'منتجات هدايا العيد')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('Choose the perfect delivery-ready gift package in Qatar.', 'اختر الحزمة المثالية الجاهزة للتوصيل داخل قطر.')}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchesArray.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col group relative">
                <div className="h-48 relative overflow-hidden bg-muted">
                  <img 
                    src={match.image || '/match-bg.png'} 
                    alt={language === 'ar' ? `${match.homeTeamAr} ضد ${match.awayTeamAr}` : `${match.homeTeam} vs ${match.awayTeam}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="text-primary font-bold bg-background/80 px-3 py-1 rounded backdrop-blur-sm text-sm">
                      {language === 'ar' ? match.stageAr : match.stage}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                      {format(new Date(match.matchDate), 'MMM d, yyyy • HH:mm')}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="text-3xl font-bold mb-2">{language === 'ar' ? match.homeTeamAr : match.homeTeam}</div>
                    <div className="text-sm text-muted-foreground">{language === 'ar' ? match.awayTeamAr : match.awayTeam}</div>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{t('Package', 'الباقة')}:</span> {language === 'ar' ? match.stadiumAr : match.stadium}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{t('Location', 'المنطقة')}:</span> {language === 'ar' ? match.cityAr : match.city}
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <div className="text-xs text-muted-foreground">{t('From', 'تبدأ من')}</div>
                        <div className="text-xl font-bold text-primary">${match.minPrice}</div>
                      </div>
                      <Link href={`/book/${match.id}`}>
                        <Button className="font-bold">{t('Buy Now', 'اشتري الآن')}</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {matchesArray.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              {t('No matches found.', 'لم يتم العثور على مباريات.')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
