import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export interface SiteSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export function useGetSiteSettings() {
  return useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => await customFetch<SiteSetting[]>("/api/settings"),
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      return await customFetch<SiteSetting[]>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ data }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
    },
  });
}
