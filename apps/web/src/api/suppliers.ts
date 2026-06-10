import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { CreateSupplierInput } from '@lieferradar/shared';
import { QUERY_KEYS } from './orders';

export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEYS.suppliers(),
    queryFn: async () => {
      const { data } = await apiClient.get('/suppliers');
      return data;
    },
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/suppliers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSupplierInput) => {
      const { data } = await apiClient.post('/suppliers', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
