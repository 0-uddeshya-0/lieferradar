import { useState, useCallback } from 'react';
import type { OrderStatus } from '@lieferradar/shared';

export interface OrderFilters {
  status?: OrderStatus;
  supplierId?: string;
  overdueOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'dueDate' | 'updatedAt' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export function useFilters(initial: OrderFilters = {}) {
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'dueDate',
    sortDir: 'asc',
    ...initial,
  });

  const updateFilter = useCallback(<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, pageSize: 20, sortBy: 'dueDate', sortDir: 'asc' });
  }, []);

  return { filters, updateFilter, resetFilters, setFilters };
}
