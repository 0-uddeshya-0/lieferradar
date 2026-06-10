import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { isDemoMode } from '../demo/config';
import { DEMO_USER } from '../demo/mockData';

interface AuthUser {
  user: { id: string; email: string; name: string };
  organization: { id: string; name: string };
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (isDemoMode) return DEMO_USER;
      const { data } = await apiClient.get<AuthUser>('/auth/me');
      return data;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (isDemoMode) return DEMO_USER;
      const { data } = await apiClient.post<AuthUser>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: {
      orgName: string;
      email: string;
      password: string;
      name: string;
    }) => {
      if (isDemoMode) return DEMO_USER;
      const { data } = await apiClient.post<AuthUser>('/auth/register', input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (isDemoMode) return;
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      if (!isDemoMode) queryClient.clear();
    },
  });

  return {
    user: data?.user,
    organization: data?.organization,
    isLoading: isDemoMode ? false : isLoading,
    isAuthenticated: isDemoMode ? true : !!data,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
