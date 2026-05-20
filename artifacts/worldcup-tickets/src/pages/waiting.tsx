import { useRoute } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function WaitingPage() {
  const [, params] = useRoute('/waiting/:orderId');
  const orderId = parseInt(params?.orderId || '0', 10);
  const { t } = useLanguage();
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  // Update elapsed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll order status every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const updatedOrder = await response.json() as { status: string };
          // If order status changes from 'waiting', redirect accordingly
          if (updatedOrder.status === 'completed') {
            window.location.href = '/';
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[400px] max-w-lg mx-auto" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20">{t('Order not found', 'الطلب غير موجود')}</div>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin" style={{ 
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              animationDuration: '2s'
            }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{t('Please Wait', 'يرجى الانتظار')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('Please do not close this page. Your order is being processed.', 'يرجى عدم إغلاق هذه الصفحة. طلبك قيد المعالجة.')}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-700">
          <div className="font-semibold mb-2">{t('Order Details', 'تفاصيل الطلب')}</div>
          <div className="space-y-1">
            <div>{t('Order', 'الطلب')} #{order.id}</div>
            <div>{t('Amount', 'المبلغ')}: ${order.totalPrice}</div>
            <div>{t('Customer', 'العميل')}: {order.customerName}</div>
            <div>{t('Status', 'الحالة')}: {order.status}</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            {t('Processing your order...', 'جاري معالجة طلبك...')}
          </div>
        </div>
      </div>
    </div>
  );
}
