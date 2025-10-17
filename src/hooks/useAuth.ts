import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { LoginInput } from '../lib/validation';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      toast.success('Login successful');
    },
    onError: (error: Error) => {
      toast.error(`Login failed: ${error.message}`);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Still clear local auth even if server logout fails
      clearAuth();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      queryClient.clear();
    },
  });

  const login = async (credentials: LoginInput) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  return {
    login,
    logout,
    isAuthenticated,
    user,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
