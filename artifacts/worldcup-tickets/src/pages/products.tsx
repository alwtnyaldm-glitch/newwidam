import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useGetSiteSettings, useListProducts } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

export default function Products() {
  const { t, language } = useLanguage();
  const { data: settings = [] } = useGetSiteSettings();
  const { data: products, isLoading } = useListProducts();
  const productsArray = Array.isArray(products) ? products : [];

  const settingsMap = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const getText = (key: string, defaultValue: string, defaultValueAr: string) =>
    language === 'ar'
      ? (settingsMap[`${key}Ar`] as string | undefined) ?? defaultValueAr
      : (settingsMap[key] as string | undefined) ?? defaultValue;

  const pageTitle = getText('productsPageTitle', 'Our Best Meat Products', 'أفضل منتجاتنا من اللحوم');
  const pageSubtitle = getText(
    'productsPageSubtitle',
    'Browse fresh premium meat products, choose your favorite cut, and order for fast delivery.',
    'تصفح منتجات اللحوم الطازجة والمميزة، واختر القطعة المناسبة لك للتوصيل السريع.'
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80 mb-2">{t('Shop', 'التسوق')}</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{t('Our Best Meat Products', 'أفضل منتجاتنا من اللحوم')}</h1>
            <p className="max-w-2xl text-slate-600 dark:text-slate-400 mt-4">
              {pageSubtitle}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">{t('Back to Home', 'العودة للرئيسية')}</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[420px] w-full rounded-3xl" />
            ))
          ) : (
            productsArray.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative overflow-hidden bg-slate-100">
                    <img
                      src={product.image || '/product-placeholder.png'}
                      alt={language === 'ar' ? product.titleAr : product.title}
                      className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                      {language === 'ar' ? product.categoryAr : product.category}
                    </div>
                  </div>
                  <CardContent className="flex flex-col gap-4 px-6 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{language === 'ar' ? product.titleAr : product.title}</h2>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                          {language === 'ar' ? product.descriptionAr : product.description}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-green-50 px-4 py-2 text-lg font-bold text-emerald-700">
                        {product.price.toLocaleString()} ر.ق
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <span className="text-yellow-500">★ ★ ★ ★ ★</span>
                        <span>{t('Premium', 'ممتاز')}</span>
                      </div>
                      <Link href={`/book/${product.id}`}>
                        <Button className="w-full rounded-full py-3 px-6 text-base font-semibold">
                          {t('Add to cart', 'أضف إلى السلة')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
