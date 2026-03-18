import apiClient from './client'
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  Category,
  ProductSaleStats,
} from '@/types'

export const productsApi = {
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams()
    
    if (filters?.category_id) params.append('category_id', filters.category_id)
    if (filters?.min_price) params.append('min_price', filters.min_price.toString())
    if (filters?.max_price) params.append('max_price', filters.max_price.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.page_size) params.append('page_size', filters.page_size.toString())
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)

    const response = await apiClient.get<ProductsResponse>(`/products/get?${params.toString()}`)
    return response.data
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ product: Product }>(`/products/${id}`)
    return response.data.product
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<{ product: Product }>('/products/add', data)
    return response.data.product
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<{ product: Product }>(`/products/${id}`, data)
    return response.data.product
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  updateProductStatus: async (id: string, isActive: boolean): Promise<Product> => {
    const response = await apiClient.patch<{ product: Product }>(`/products/${id}/status`, {
      is_active: isActive,
    })
    return response.data.product
  },

  getProductSaleStats: async (id: string): Promise<ProductSaleStats> => {
    const response = await apiClient.get<ProductSaleStats>(`/products/${id}/salestat`)
    return response.data
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ categories: Category[] }>('/categories')
    return response.data.categories
  },

  createCategory: async (data: { name: string; description: string }): Promise<Category> => {
    const response = await apiClient.post<{ category: Category }>('/categories', data)
    return response.data.category
  },
}

export default productsApi
