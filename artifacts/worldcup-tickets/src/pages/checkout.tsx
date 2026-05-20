import { useRoute, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const [, params] = useRoute('/checkout/:orderId');
  const [, setLocation] = useLocation();
  const orderId = parseInt(params?.orderId || '0', 10);
  const { t } = useLanguage();
  
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  const handlePayment = () => {
    if (!order) return;
    setLocation(`/visa/${order.id}`);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[400px] max-w-lg mx-auto" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20">{t('Order not found', 'الطلب غير موجود')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{t('Order Summary', 'ملخص الطلب')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('Order ID:', 'رقم الطلب:')} #{order.id}
        </p>

        <div className="space-y-4 text-left border-y border-border py-6 mb-8">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('Customer', 'العميل')}</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('Match', 'المباراة')}</span>
            <span className="font-medium">{order.matchName || `Match #${order.matchId}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('Email', 'البريد الإلكتروني')}</span>
            <span className="font-medium">{order.email}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <span className="text-xl font-bold">{t('Total', 'الإجمالي')}</span>
          <span className="text-3xl font-black text-primary">${order.totalPrice}</span>
        </div>

        <Button size="lg" className="w-full text-lg font-bold" onClick={handlePayment}>
          {t('Pay with Visa / MasterCard', 'ادفع ببطاقة فيزا / ماستر كارد')}
        </Button>
      </div>
    </div>
  );
}
