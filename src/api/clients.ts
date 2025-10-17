import { apiClient } from '../lib/api-client';
import { Client } from '../types/client';
import { ClientInput } from '../lib/validation';

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/clients');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: ClientInput): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ClientInput>): Promise<Client> => {
    const response = await apiClient.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
