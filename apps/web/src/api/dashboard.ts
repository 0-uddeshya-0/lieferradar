import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { QUERY_KEYS } from './orders';

export function useDashboardSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.summary(),
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/summary');
      return data;
    },
  });
}

export function useScorecard() {
  return useQuery({
    queryKey: QUERY_KEYS.scorecard(),
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/scorecard');
      return data;
    },
  });
}
