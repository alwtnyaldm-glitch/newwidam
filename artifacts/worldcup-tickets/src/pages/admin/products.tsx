import { AdminLayout } from './dashboard';
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminProducts() {
  const { data: products, isLoading, refetch } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    image: '',
    price: '',
    category: '',
    categoryAr: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({
        title: formData.title,
        titleAr: formData.titleAr,
        description: formData.description || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        image: formData.image || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        categoryAr: formData.categoryAr,
      });
      setIsCreating(false);
      setFormData({
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        image: '',
        price: '',
        category: '',
        categoryAr: '',
      });
      refetch();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        id,
        data: {
          title: formData.title || undefined,
          titleAr: formData.titleAr || undefined,
          description: formData.description || undefined,
          descriptionAr: formData.descriptionAr || undefined,
          image: formData.image || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          category: formData.category || undefined,
          categoryAr: formData.categoryAr || undefined,
        },
      });
      setEditingId(null);
      setFormData({
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        image: '',
        price: '',
        category: '',
        categoryAr: '',
      });
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      titleAr: product.titleAr,
      description: product.description || '',
      descriptionAr: product.descriptionAr || '',
      image: product.image || '',
      price: product.price.toString(),
      category: product.category,
      categoryAr: product.categoryAr,
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your product inventory</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {(isCreating || editingId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => editingId ? handleUpdate(e, editingId!) : handleCreate(e)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title (English)</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title (Arabic)</label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Description (English)</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                  <Input
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category (English)</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category (Arabic)</label>
                  <Input
                    value={formData.categoryAr}
                    onChange={(e) => setFormData({ ...formData, categoryAr: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({
                    title: '',
                    titleAr: '',
                    description: '',
                    descriptionAr: '',
                    image: '',
                    price: '',
                    category: '',
                    categoryAr: '',
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map(product => (
            <Card key={product.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <p className="text-sm text-slate-500">{product.titleAr}</p>
              </CardHeader>
              <CardContent>
                {product.image && (
                  <img src={product.image} alt={product.title} className="w-full h-32 object-cover rounded mb-4" />
                )}
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Price:</span> ${product.price}</div>
                  <div><span className="font-medium">Category:</span> {product.category} / {product.categoryAr}</div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => startEdit(product)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
