import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export interface Product {
  id: number;
  title: string;
  titleAr: string;
  description: string | null;
  descriptionAr: string | null;
  image: string | null;
  price: number;
  category: string;
  categoryAr: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductInput {
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  price: number;
  category: string;
  categoryAr: string;
}

export interface UpdateProductInput {
  title?: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  price?: number;
  category?: string;
  categoryAr?: string;
  isActive?: boolean;
}

export function useListProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      return await customFetch<Product[]>("/api/products");
    },
  });
}

export function useGetProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      return await customFetch<Product>(`/api/products/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      return await customFetch<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductInput }) => {
      return await customFetch<Product>(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await customFetch<Product>(`/api/products/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
