import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { QUERY_KEYS } from './orders';
import { isDemoMode } from '../demo/config';
import * as demoStore from '../demo/store';

export function useDashboardSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.summary(),
    queryFn: async () => {
      if (isDemoMode) return demoStore.getSummary();
      const { data } = await apiClient.get('/dashboard/summary');
      return data;
    },
  });
}

export function useScorecard() {
  return useQuery({
    queryKey: QUERY_KEYS.scorecard(),
    queryFn: async () => {
      if (isDemoMode) return demoStore.getScorecard();
      const { data } = await apiClient.get('/dashboard/scorecard');
      return data;
    },
  });
}
