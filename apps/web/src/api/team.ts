import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { isDemoMode } from '../demo/config';
import * as demoStore from '../demo/store';

export interface TeamData {
  members: Array<{ id: string; name: string; email: string; createdAt: string }>;
  pendingInvites: Array<{ id: string; email: string; createdAt: string; expiresAt: string }>;
}

export function useTeam() {
  return useQuery({
    queryKey: ['team'] as const,
    queryFn: async (): Promise<TeamData> => {
      if (isDemoMode) return demoStore.getTeam();
      const { data } = await apiClient.get('/team/members');
      return data;
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (isDemoMode) return demoStore.inviteMember(email);
      const { data } = await apiClient.post('/team/invites', { email });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        demoStore.revokeInvite(id);
        return { success: true };
      }
      const { data } = await apiClient.delete(`/team/invites/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}
