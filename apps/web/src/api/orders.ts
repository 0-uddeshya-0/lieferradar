import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { CreateOrderInput } from '@lieferradar/shared';
import type { OrderFilters } from '../hooks/useFilters';
import { isDemoMode } from '../demo/config';
import { DEMO_ORDERS, DEMO_ORDER_DETAIL } from '../demo/mockData';

export const QUERY_KEYS = {
  orders: (filters?: OrderFilters) => ['orders', filters] as const,
  order: (id: string) => ['orders', id] as const,
  suppliers: () => ['suppliers'] as const,
  scorecard: () => ['dashboard', 'scorecard'] as const,
  summary: () => ['dashboard', 'summary'] as const,
};

function filterDemoOrders(filters?: OrderFilters) {
  let result = [...DEMO_ORDERS];
  if (filters?.status) {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.supplierId) {
    result = result.filter((o) => o.supplier.id === filters.supplierId);
  }
  if (filters?.overdueOnly) {
    const today = new Date();
    result = result.filter(
      (o) => new Date(o.dueDate) < today && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    );
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.partDescription.toLowerCase().includes(q)
    );
  }
  return result;
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.orders(filters),
    queryFn: async () => {
      if (isDemoMode) return { orders: filterDemoOrders(filters) };
      const { data } = await apiClient.get('/orders', { params: filters });
      return data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: async () => {
      if (isDemoMode) {
        const order = DEMO_ORDERS.find((o) => o.id === id);
        return order ? { ...DEMO_ORDER_DETAIL, ...order } : DEMO_ORDER_DETAIL;
      }
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
      if (isDemoMode) return { id: 'demo-new' };
      const { data } = await apiClient.post('/orders', input);
      return data;
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
  });
}

export function useRemindOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) return { success: true };
      const { data } = await apiClient.post(`/orders/${id}/remind`);
      return data;
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    },
  });
}

export function useImportOrders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (isDemoMode) return { imported: 5, errors: [] };
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/orders/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { imported: number; errors: Array<{ row: number; message: string }> };
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      }
    },
  });
}
