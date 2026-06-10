import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { CreateSupplierInput } from '@lieferradar/shared';
import { QUERY_KEYS } from './orders';
import { isDemoMode } from '../demo/config';
import { DEMO_SUPPLIERS, DEMO_SUPPLIER_DETAIL } from '../demo/mockData';

export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEYS.suppliers(),
    queryFn: async () => {
      if (isDemoMode) return DEMO_SUPPLIERS;
      const { data } = await apiClient.get('/suppliers');
      return data;
    },
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: async () => {
      if (isDemoMode) return DEMO_SUPPLIER_DETAIL;
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
      if (isDemoMode) return { id: 'demo-supplier' };
      const { data } = await apiClient.post('/suppliers', input);
      return data;
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
  });
}
