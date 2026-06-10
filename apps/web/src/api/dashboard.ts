import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { QUERY_KEYS } from './orders';
import { isDemoMode } from '../demo/config';
import { DEMO_SUMMARY, DEMO_SCORECARD } from '../demo/mockData';

export function useDashboardSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.summary(),
    queryFn: async () => {
      if (isDemoMode) return DEMO_SUMMARY;
      const { data } = await apiClient.get('/dashboard/summary');
      return data;
    },
  });
}

export function useScorecard() {
  return useQuery({
    queryKey: QUERY_KEYS.scorecard(),
    queryFn: async () => {
      if (isDemoMode) return DEMO_SCORECARD;
      const { data } = await apiClient.get('/dashboard/scorecard');
      return data;
    },
  });
}
