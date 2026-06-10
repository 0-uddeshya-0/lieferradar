import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { CreateOrderInput } from '@lieferradar/shared';
import type { OrderFilters } from '../hooks/useFilters';

export const QUERY_KEYS = {
  orders: (filters?: OrderFilters) => ['orders', filters] as const,
  order: (id: string) => ['orders', id] as const,
  suppliers: () => ['suppliers'] as const,
  scorecard: () => ['dashboard', 'scorecard'] as const,
  summary: () => ['dashboard', 'summary'] as const,
};

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.orders(filters),
    queryFn: async () => {
      const { data } = await apiClient.get('/orders', { params: filters });
      return data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const { data } = await apiClient.post('/orders', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRemindOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/orders/${id}/remind`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useImportOrders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/orders/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { imported: number; errors: Array<{ row: number; message: string }> };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
