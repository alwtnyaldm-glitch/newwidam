import { useRoute, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { useGetSiteSettings } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetProduct } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  deliveryAddress: z.string().min(10, 'Delivery address is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  quantity: z.string().min(1, 'Quantity is required'),
});

export default function Book() {
  const [, params] = useRoute('/book/:productId');
  const productId = parseInt(params?.productId || '0', 10);
  const { t, language } = useLanguage();
  const { data: settings = [] } = useGetSiteSettings();
  const [, setLocation] = useLocation();

  const settingsMap = Object.fromEntries(settings.map((item) => [item.key, item.value]));
  const getText = (key: string, defaultValue: string, defaultValueAr: string) =>
    language === 'ar'
      ? (settingsMap[`${key}Ar`] as string | undefined) ?? defaultValueAr
      : (settingsMap[key] as string | undefined) ?? defaultValue;

  const customerNameLabel = getText('orderFormCustomerNameLabel', 'Full Name', 'الاسم الكامل');
  const phoneLabel = getText('orderFormPhoneLabel', 'Phone Number', 'رقم الهاتف');
  const deliveryAddressLabel = getText('orderFormAddressLabel', 'Delivery Address', 'عنوان التوصيل');
  const deliveryDateLabel = getText('orderFormDateLabel', 'Delivery Date', 'موعد الاستلام');
  const quantityLabel = getText('orderFormQuantityLabel', 'Quantity', 'الكمية');
  const proceedButton = getText('orderFormSubmitButton', 'Proceed to Visa', 'متابعة إلى فيزا');
  const totalAmountLabel = getText('orderFormTotalAmountLabel', 'Total Amount', 'المبلغ الإجمالي');

  const { data: product, isLoading } = useGetProduct(productId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      phone: '',
      deliveryAddress: '',
      deliveryDate: '',
      quantity: '1',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!product) return;

    const quantity = parseInt(values.quantity);
    const totalPrice = product.price * quantity;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: values.customerName,
          phone: values.phone,
          email: 'no-reply@meatshop.local',
          country: 'Qatar',
          deliveryAddress: values.deliveryAddress,
          deliveryDate: values.deliveryDate,
          productId: product.id,
          quantity: quantity,
          totalPrice: totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      setLocation(`/checkout/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[400px] max-w-2xl mx-auto" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20">{t('Product not found', 'المنتج غير موجود')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('Order Details', 'بيانات الطلب')}</h1>
        <p className="text-muted-foreground">
          {t('Enter your full name, phone number and delivery address.', 'أدخل الاسم الكامل ورقم الهاتف وعنوان التوصيل.')}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
        <div className="mb-8 rounded-2xl bg-background p-6 text-sm text-slate-700">
          <h2 className="text-xl font-bold mb-3">{language === 'ar' ? product.titleAr : product.title}</h2>
          <p className="text-muted-foreground mb-2">{language === 'ar' ? product.descriptionAr : product.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1">{t('Price', 'السعر')}: ${product.price}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{t('Category', 'الفئة')}: {language === 'ar' ? product.categoryAr : product.category}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{customerNameLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{phoneLabel}</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{deliveryAddressLabel}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{deliveryDateLabel}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{quantityLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t border-border pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <div className="text-muted-foreground text-sm mb-1">{totalAmountLabel}</div>
                <div className="text-3xl font-bold text-primary">${product.price * parseInt(form.watch('quantity') || '1')}</div>
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px] text-lg font-bold">
                {proceedButton}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
