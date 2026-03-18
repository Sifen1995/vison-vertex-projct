// User types
export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: number
  is_seller_verified: boolean
  mfa_enabled: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: User
  access_token: string
  refresh_token: string
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface MFASetupResponse {
  message: string
  secret: string
  qr_code: string
}

export interface MFAVerifyRequest {
  code: string
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  category?: Category
  image_url: string
  seller_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  image_url: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  stock?: number
  category_id?: string
  image_url?: string
  is_active?: boolean
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ProductFilters {
  category_id?: string
  min_price?: number
  max_price?: number
  search?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface ProductSaleStats {
  product_id: string
  total_sales: number
  total_revenue: number
  total_orders: number
}

// Order types
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  price: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: PaymentStatus
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface CreateOrderRequest {
  items: {
    product_id: string
    quantity: number
  }[]
  shipping_address: string
  payment_method: string
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  page_size: number
}

// Cart types
export interface CartItem {
  product: Product
  quantity: number
}

// Payment types
export interface InitiatePaymentRequest {
  order_id: string
  amount: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  callback_url?: string
  return_url?: string
}

export interface PaymentResponse {
  message: string
  checkout_url: string
  tx_ref: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// Pagination
export interface PaginationParams {
  page?: number
  page_size?: number
}

// User roles
export const USER_ROLES = {
  ADMIN: 1,
  CUSTOMER: 2,
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
