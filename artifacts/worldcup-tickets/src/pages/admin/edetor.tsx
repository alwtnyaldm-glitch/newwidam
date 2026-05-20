import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminLayout } from "./dashboard";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useGetSiteSettings, useUpdateSiteSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";

const defaultSettings = {
  homeHeroTitle: "PREMIUM MEAT PRODUCTS",
  homeHeroTitleAr: "منتجات اللحم المميزة",
  homeHeroSubtitle: "Choose fresh, high-quality meat products with fast delivery inside Qatar.",
  homeHeroSubtitleAr: "اختر منتجات لحم طازجة وعالية الجودة مع توصيل سريع داخل قطر.",
  homeFeaturedTitle: "Featured Products",
  homeFeaturedTitleAr: "المنتجات المميزة",
  homeFeaturedSubtitle: "Fresh, high-quality meat products for your family.",
  homeFeaturedSubtitleAr: "منتجات لحم طازجة وعالية الجودة لعائلتك.",
  productsPageTitle: "Our Best Meat Products",
  productsPageTitleAr: "أفضل منتجاتنا من اللحوم",
  productsPageSubtitle: "Browse fresh premium meat products, choose your favorite cut, and order for fast delivery.",
  productsPageSubtitleAr: "تصفح منتجات اللحوم الطازجة والمميزة، واختر القطعة المناسبة لك للتوصيل السريع.",
  orderFormCustomerNameLabel: "Full Name",
  orderFormCustomerNameLabelAr: "الاسم الكامل",
  orderFormPhoneLabel: "Phone Number",
  orderFormPhoneLabelAr: "رقم الهاتف",
  orderFormAddressLabel: "Delivery Address",
  orderFormAddressLabelAr: "عنوان التوصيل",
  orderFormDateLabel: "Delivery Date",
  orderFormDateLabelAr: "موعد الاستلام",
  orderFormQuantityLabel: "Quantity",
  orderFormQuantityLabelAr: "الكمية",
  orderFormSubmitButton: "Proceed to Visa",
  orderFormSubmitButtonAr: "متابعة إلى فيزا",
  orderFormTotalAmountLabel: "Total Amount",
  orderFormTotalAmountLabelAr: "المبلغ الإجمالي",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      {children}
    </div>
  );
}

export default function AdminEditor() {
  const { data: products, isLoading: productsLoading, refetch } = useListProducts();
  const { data: settings = [], isLoading: settingsLoading } = useGetSiteSettings();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();

  const settingsMap = useMemo(
    () => Object.fromEntries(settings.map((item) => [item.key, item.value])),
    [settings]
  );

  const [formState, setFormState] = useState({
    homeHeroTitle: "",
    homeHeroTitleAr: "",
    homeHeroSubtitle: "",
    homeHeroSubtitleAr: "",
    homeFeaturedTitle: "",
    homeFeaturedTitleAr: "",
    homeFeaturedSubtitle: "",
    homeFeaturedSubtitleAr: "",
    productsPageTitle: "",
    productsPageTitleAr: "",
    productsPageSubtitle: "",
    productsPageSubtitleAr: "",
    orderFormCustomerNameLabel: "",
    orderFormCustomerNameLabelAr: "",
    orderFormPhoneLabel: "",
    orderFormPhoneLabelAr: "",
    orderFormAddressLabel: "",
    orderFormAddressLabelAr: "",
    orderFormDateLabel: "",
    orderFormDateLabelAr: "",
    orderFormQuantityLabel: "",
    orderFormQuantityLabelAr: "",
    orderFormSubmitButton: "",
    orderFormSubmitButtonAr: "",
    orderFormTotalAmountLabel: "",
    orderFormTotalAmountLabelAr: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    image: "",
    price: "",
    category: "",
    categoryAr: "",
  });

  useEffect(() => {
    setFormState({
      homeHeroTitle: settingsMap.homeHeroTitle ?? defaultSettings.homeHeroTitle,
      homeHeroTitleAr: settingsMap.homeHeroTitleAr ?? defaultSettings.homeHeroTitleAr,
      homeHeroSubtitle: settingsMap.homeHeroSubtitle ?? defaultSettings.homeHeroSubtitle,
      homeHeroSubtitleAr: settingsMap.homeHeroSubtitleAr ?? defaultSettings.homeHeroSubtitleAr,
      homeFeaturedTitle: settingsMap.homeFeaturedTitle ?? defaultSettings.homeFeaturedTitle,
      homeFeaturedTitleAr: settingsMap.homeFeaturedTitleAr ?? defaultSettings.homeFeaturedTitleAr,
      homeFeaturedSubtitle: settingsMap.homeFeaturedSubtitle ?? defaultSettings.homeFeaturedSubtitle,
      homeFeaturedSubtitleAr: settingsMap.homeFeaturedSubtitleAr ?? defaultSettings.homeFeaturedSubtitleAr,
      productsPageTitle: settingsMap.productsPageTitle ?? defaultSettings.productsPageTitle,
      productsPageTitleAr: settingsMap.productsPageTitleAr ?? defaultSettings.productsPageTitleAr,
      productsPageSubtitle: settingsMap.productsPageSubtitle ?? defaultSettings.productsPageSubtitle,
      productsPageSubtitleAr: settingsMap.productsPageSubtitleAr ?? defaultSettings.productsPageSubtitleAr,
      orderFormCustomerNameLabel: settingsMap.orderFormCustomerNameLabel ?? defaultSettings.orderFormCustomerNameLabel,
      orderFormCustomerNameLabelAr: settingsMap.orderFormCustomerNameLabelAr ?? defaultSettings.orderFormCustomerNameLabelAr,
      orderFormPhoneLabel: settingsMap.orderFormPhoneLabel ?? defaultSettings.orderFormPhoneLabel,
      orderFormPhoneLabelAr: settingsMap.orderFormPhoneLabelAr ?? defaultSettings.orderFormPhoneLabelAr,
      orderFormAddressLabel: settingsMap.orderFormAddressLabel ?? defaultSettings.orderFormAddressLabel,
      orderFormAddressLabelAr: settingsMap.orderFormAddressLabelAr ?? defaultSettings.orderFormAddressLabelAr,
      orderFormDateLabel: settingsMap.orderFormDateLabel ?? defaultSettings.orderFormDateLabel,
      orderFormDateLabelAr: settingsMap.orderFormDateLabelAr ?? defaultSettings.orderFormDateLabelAr,
      orderFormQuantityLabel: settingsMap.orderFormQuantityLabel ?? defaultSettings.orderFormQuantityLabel,
      orderFormQuantityLabelAr: settingsMap.orderFormQuantityLabelAr ?? defaultSettings.orderFormQuantityLabelAr,
      orderFormSubmitButton: settingsMap.orderFormSubmitButton ?? defaultSettings.orderFormSubmitButton,
      orderFormSubmitButtonAr: settingsMap.orderFormSubmitButtonAr ?? defaultSettings.orderFormSubmitButtonAr,
      orderFormTotalAmountLabel: settingsMap.orderFormTotalAmountLabel ?? defaultSettings.orderFormTotalAmountLabel,
      orderFormTotalAmountLabelAr: settingsMap.orderFormTotalAmountLabelAr ?? defaultSettings.orderFormTotalAmountLabelAr,
    });
  }, [settingsMap]);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync(formState);
      toast({ title: "Saved", description: "Site content updated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to save settings.", variant: "destructive" });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({
        title: productForm.title,
        titleAr: productForm.titleAr,
        description: productForm.description || undefined,
        descriptionAr: productForm.descriptionAr || undefined,
        image: productForm.image || undefined,
        price: parseFloat(productForm.price),
        category: productForm.category,
        categoryAr: productForm.categoryAr,
      });
      setProductForm({ title: "", titleAr: "", description: "", descriptionAr: "", image: "", price: "", category: "", categoryAr: "" });
      setIsCreating(false);
      refetch();
      toast({ title: "Created", description: "Product added successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to add product.", variant: "destructive" });
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        id,
        data: {
          title: productForm.title || undefined,
          titleAr: productForm.titleAr || undefined,
          description: productForm.description || undefined,
          descriptionAr: productForm.descriptionAr || undefined,
          image: productForm.image || undefined,
          price: productForm.price ? parseFloat(productForm.price) : undefined,
          category: productForm.category || undefined,
          categoryAr: productForm.categoryAr || undefined,
        },
      });
      setEditingId(null);
      setProductForm({ title: "", titleAr: "", description: "", descriptionAr: "", image: "", price: "", category: "", categoryAr: "" });
      refetch();
      toast({ title: "Updated", description: "Product updated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to update product.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      refetch();
      toast({ title: "Deleted", description: "Product removed successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to delete product.", variant: "destructive" });
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setProductForm({
      title: product.title,
      titleAr: product.titleAr,
      description: product.description || "",
      descriptionAr: product.descriptionAr || "",
      image: product.image || "",
      price: product.price.toString(),
      category: product.category,
      categoryAr: product.categoryAr,
    });
  };

  const settingsSaving = updateSettings.isPending || settingsLoading;

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Editor Page</h1>
              <p className="text-slate-500 dark:text-slate-400">Edit homepage content, products page content, order form labels and manage products.</p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Homepage & Order Form Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSettingsSave} className="grid gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Hero Section</h2>
                    <Field label="Hero Title (English)">
                      <Input
                        value={formState.homeHeroTitle}
                        onChange={(e) => setFormState({ ...formState, homeHeroTitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Hero Title (Arabic)">
                      <Input
                        value={formState.homeHeroTitleAr}
                        onChange={(e) => setFormState({ ...formState, homeHeroTitleAr: e.target.value })}
                      />
                    </Field>
                    <Field label="Hero Subtitle (English)">
                      <Textarea
                        value={formState.homeHeroSubtitle}
                        onChange={(e) => setFormState({ ...formState, homeHeroSubtitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Hero Subtitle (Arabic)">
                      <Textarea
                        value={formState.homeHeroSubtitleAr}
                        onChange={(e) => setFormState({ ...formState, homeHeroSubtitleAr: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Featured Section</h2>
                    <Field label="Featured Title (English)">
                      <Input
                        value={formState.homeFeaturedTitle}
                        onChange={(e) => setFormState({ ...formState, homeFeaturedTitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Featured Title (Arabic)">
                      <Input
                        value={formState.homeFeaturedTitleAr}
                        onChange={(e) => setFormState({ ...formState, homeFeaturedTitleAr: e.target.value })}
                      />
                    </Field>
                    <Field label="Featured Subtitle (English)">
                      <Textarea
                        value={formState.homeFeaturedSubtitle}
                        onChange={(e) => setFormState({ ...formState, homeFeaturedSubtitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Featured Subtitle (Arabic)">
                      <Textarea
                        value={formState.homeFeaturedSubtitleAr}
                        onChange={(e) => setFormState({ ...formState, homeFeaturedSubtitleAr: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Products Page</h2>
                    <Field label="Products Page Title (English)">
                      <Input
                        value={formState.productsPageTitle}
                        onChange={(e) => setFormState({ ...formState, productsPageTitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Products Page Title (Arabic)">
                      <Input
                        value={formState.productsPageTitleAr}
                        onChange={(e) => setFormState({ ...formState, productsPageTitleAr: e.target.value })}
                      />
                    </Field>
                    <Field label="Products Page Subtitle (English)">
                      <Textarea
                        value={formState.productsPageSubtitle}
                        onChange={(e) => setFormState({ ...formState, productsPageSubtitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Products Page Subtitle (Arabic)">
                      <Textarea
                        value={formState.productsPageSubtitleAr}
                        onChange={(e) => setFormState({ ...formState, productsPageSubtitleAr: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Order Form Labels</h2>
                    <Field label="Customer Name Label (English)">
                      <Input
                        value={formState.orderFormCustomerNameLabel}
                        onChange={(e) => setFormState({ ...formState, orderFormCustomerNameLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="Customer Name Label (Arabic)">
                      <Input
                        value={formState.orderFormCustomerNameLabelAr}
                        onChange={(e) => setFormState({ ...formState, orderFormCustomerNameLabelAr: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone Label (English)">
                      <Input
                        value={formState.orderFormPhoneLabel}
                        onChange={(e) => setFormState({ ...formState, orderFormPhoneLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone Label (Arabic)">
                      <Input
                        value={formState.orderFormPhoneLabelAr}
                        onChange={(e) => setFormState({ ...formState, orderFormPhoneLabelAr: e.target.value })}
                      />
                    </Field>
                    <Field label="Address Label (English)">
                      <Input
                        value={formState.orderFormAddressLabel}
                        onChange={(e) => setFormState({ ...formState, orderFormAddressLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="Address Label (Arabic)">
                      <Input
                        value={formState.orderFormAddressLabelAr}
                        onChange={(e) => setFormState({ ...formState, orderFormAddressLabelAr: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Delivery Date Label (English)">
                        <Input
                          value={formState.orderFormDateLabel}
                          onChange={(e) => setFormState({ ...formState, orderFormDateLabel: e.target.value })}
                        />
                      </Field>
                      <Field label="Delivery Date Label (Arabic)">
                        <Input
                          value={formState.orderFormDateLabelAr}
                          onChange={(e) => setFormState({ ...formState, orderFormDateLabelAr: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Quantity Label (English)">
                        <Input
                          value={formState.orderFormQuantityLabel}
                          onChange={(e) => setFormState({ ...formState, orderFormQuantityLabel: e.target.value })}
                        />
                      </Field>
                      <Field label="Quantity Label (Arabic)">
                        <Input
                          value={formState.orderFormQuantityLabelAr}
                          onChange={(e) => setFormState({ ...formState, orderFormQuantityLabelAr: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="Submit Button Text (English)">
                      <Input
                        value={formState.orderFormSubmitButton}
                        onChange={(e) => setFormState({ ...formState, orderFormSubmitButton: e.target.value })}
                      />
                    </Field>
                    <Field label="Submit Button Text (Arabic)">
                      <Input
                        value={formState.orderFormSubmitButtonAr}
                        onChange={(e) => setFormState({ ...formState, orderFormSubmitButtonAr: e.target.value })}
                      />
                    </Field>
                    <Field label="Total Amount Label (English)">
                      <Input
                        value={formState.orderFormTotalAmountLabel}
                        onChange={(e) => setFormState({ ...formState, orderFormTotalAmountLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="Total Amount Label (Arabic)">
                      <Input
                        value={formState.orderFormTotalAmountLabelAr}
                        onChange={(e) => setFormState({ ...formState, orderFormTotalAmountLabelAr: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button type="submit" disabled={settingsSaving}>
                    {settingsSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Products Inventory</h2>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Product
            </Button>
          </div>

          {(isCreating || editingId) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => (editingId ? handleUpdate(e, editingId) : handleCreate(e))} className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Title (English)">
                      <Input
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Title (Arabic)">
                      <Input
                        value={productForm.titleAr}
                        onChange={(e) => setProductForm({ ...productForm, titleAr: e.target.value })}
                        required
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Description (English)">
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </Field>
                    <Field label="Description (Arabic)">
                      <Textarea
                        value={productForm.descriptionAr}
                        onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Category (English)">
                      <Input
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Category (Arabic)">
                      <Input
                        value={productForm.categoryAr}
                        onChange={(e) => setProductForm({ ...productForm, categoryAr: e.target.value })}
                        required
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Price">
                      <Input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Image URL">
                      <Input
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                      {editingId ? "Save changes" : "Create product"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                      setProductForm({ title: "", titleAr: "", description: "", descriptionAr: "", image: "", price: "", category: "", categoryAr: "" });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => <Skeleton key={index} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <Card key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.image && <img src={product.image} alt={product.title} className="h-36 w-full object-cover rounded-xl" />}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p>{product.titleAr}</p>
                      <p>{product.category} / {product.categoryAr}</p>
                      <p className="font-semibold mt-2">${product.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
