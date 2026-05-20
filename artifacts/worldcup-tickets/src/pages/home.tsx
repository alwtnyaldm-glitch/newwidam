import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useListProducts, useListPosts } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { t, language } = useLanguage();
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: posts, isLoading: postsLoading } = useListPosts();
  const productsArray = Array.isArray(products) ? products : [];
  const postsArray = Array.isArray(posts) ? posts : [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.png" 
            alt="Eid Gifts" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
              {t('PREMIUM MEAT PRODUCTS', 'منتجات اللحم المميزة')} <br />
              <span className="text-primary">{t('FOR YOUR FAMILY', 'لعائلتك')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl mx-auto font-medium">
              {t('Choose fresh, high-quality meat products with fast delivery inside Qatar.', 'اختر منتجات لحم طازجة وعالية الجودة مع توصيل سريع داخل قطر.')}
            </p>
            <Link href="/products">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all">
                {t('Shop Now', 'تسوق الآن')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('Featured Products', 'المنتجات المميزة')}</h2>
              <p className="text-muted-foreground">{t('Fresh, high-quality meat products for your family.', 'منتجات لحم طازجة وعالية الجودة لعائلتك.')}</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="hidden md:flex">{t('View All Products', 'عرض كل المنتجات')}</Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-xl bg-card" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsArray.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col group relative">
                    <div className="h-48 relative overflow-hidden bg-muted">
                      <img 
                        src={product.image || '/product-placeholder.png'} 
                        alt={language === 'ar' ? product.titleAr : product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="text-primary font-bold bg-background/80 px-3 py-1 rounded backdrop-blur-sm text-sm">
                          {language === 'ar' ? product.categoryAr : product.category}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold mb-2">{language === 'ar' ? product.titleAr : product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{language === 'ar' ? product.descriptionAr : product.description}</p>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center border-t border-border pt-4">
                          <div>
                            <div className="text-xs text-muted-foreground">{t('Price', 'السعر')}</div>
                            <div className="text-xl font-bold text-primary">${product.price}</div>
                          </div>
                          <Link href={`/book/${product.id}`}>
                            <Button className="font-bold">{t('Order Now', 'اطلب الآن')}</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <Link href="/products">
              <Button variant="outline" className="w-full">{t('View All Products', 'عرض كل المنتجات')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{t('Latest News', 'أحدث الأخبار')}</h2>
          
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {postsArray.filter((p) => p.isPublished).slice(0, 2).map((post, index) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Card className="h-full bg-background border-border overflow-hidden hover:border-primary/50 transition-all">
                    {post.image && (
                      <div className="h-48 overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="text-xs text-primary font-bold mb-3">{format(new Date(post.createdAt), 'MMMM d, yyyy')}</div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {language === 'ar' ? post.titleAr : post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {language === 'ar' ? post.contentAr : post.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials / Features */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">{t('Why Book With Us', 'لماذا تحجز معنا')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-card border border-primary/20 rounded-full flex items-center justify-center text-primary text-2xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                ⭐
              </div>
              <h3 className="text-xl font-bold">{t('Official Partner', 'شريك رسمي')}</h3>
              <p className="text-muted-foreground">{t('100% authentic tickets directly from the source.', 'تذاكر أصلية 100% مباشرة من المصدر.')}</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-card border border-primary/20 rounded-full flex items-center justify-center text-primary text-2xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                🔒
              </div>
              <h3 className="text-xl font-bold">{t('Secure Booking', 'حجز آمن')}</h3>
              <p className="text-muted-foreground">{t('Bank-grade encryption for all transactions.', 'تشفير بمستوى البنوك لجميع المعاملات.')}</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-card border border-primary/20 rounded-full flex items-center justify-center text-primary text-2xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                🏟️
              </div>
              <h3 className="text-xl font-bold">{t('Best Seats', 'أفضل المقاعد')}</h3>
              <p className="text-muted-foreground">{t('Interactive maps to pick your perfect view.', 'خرائط تفاعلية لاختيار أفضل رؤية لك.')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
