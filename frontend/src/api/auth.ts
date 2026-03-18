import apiClient from './client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  MFASetupResponse,
  MFAVerifyRequest,
} from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<{ message: string; user: User }> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/me')
    return response.data.user
  },

  setupMFA: async (): Promise<MFASetupResponse> => {
    const response = await apiClient.post<MFASetupResponse>('/auth/mfa/setup')
    return response.data
  },

  verifyMFA: async (data: MFAVerifyRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/mfa/verify', data)
    return response.data
  },

  disableMFA: async (data: MFAVerifyRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/mfa/disable', data)
    return response.data
  },
}

export default authApi
