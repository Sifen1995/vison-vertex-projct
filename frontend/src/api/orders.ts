import apiClient from './client'
import type {
  Order,
  OrdersResponse,
  CreateOrderRequest,
  PaginationParams,
  InitiatePaymentRequest,
  PaymentResponse,
} from '@/types'

export const ordersApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<{ order: Order }>('/orders/create', data)
    return response.data.order
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<{ order: Order }>(`/orders/${id}/get-one`)
    return response.data.order
  },

  getUserOrders: async (params?: PaginationParams): Promise<OrdersResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())

    const response = await apiClient.get<OrdersResponse>(`/orders?${queryParams.toString()}`)
    return response.data
  },

  // Admin endpoints
  getAllOrders: async (params?: PaginationParams): Promise<OrdersResponse> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())

    const response = await apiClient.get<OrdersResponse>(`/admin/orders?${queryParams.toString()}`)
    return response.data
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<{ order: Order }>(`/admin/orders/${id}/status`, {
      status,
    })
    return response.data.order
  },

  // Payment
  initiatePayment: async (data: InitiatePaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post<PaymentResponse>('/payments/initiate', data)
    return response.data
  },

  verifyPayment: async (txRef: string): Promise<{ message: string; status: string }> => {
    const response = await apiClient.get(`/payments/verify/${txRef}`)
    return response.data
  },
}

export default ordersApi
