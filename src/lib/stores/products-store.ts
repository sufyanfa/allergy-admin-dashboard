import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Product,
  ProductCategory,
  AllergyCheck,
  ProductSearchFilters,
  ProductSearchResult,
  ProductsOverview,
  ProductsOverviewResponse,
  PaginatedResponse,
  ApiResponse
} from '@/types'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/lib/api/client'

interface ProductsState {
  products: Product[]
  categories: ProductCategory[]
  currentProduct: Product | null
  searchResults: ProductSearchResult | null
  overview: ProductsOverview | null
  isLoading: boolean
  error: string | null
  filters: ProductSearchFilters
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasMore: boolean
  }
}

interface ProductsActions {
  // Product CRUD
  fetchProducts: (page?: number, limit?: number) => Promise<void>
  fetchProduct: (id: string) => Promise<Product>
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>

  // Overview
  fetchProductsOverview: () => Promise<void>

  // Search and Filter
  searchProducts: (filters: ProductSearchFilters) => Promise<void>
  searchIntegrated: (query: string) => Promise<ProductSearchResult>

  // Categories
  fetchCategories: () => Promise<void>

  // Barcode
  fetchProductByBarcode: (barcode: string) => Promise<Product>

  // Allergy Check
  checkProductAllergies: (productId: string, userId?: string) => Promise<AllergyCheck>

  // State Management
  setCurrentProduct: (product: Product | null) => void
  setFilters: (filters: Partial<ProductSearchFilters>) => void
  clearFilters: () => void
  setError: (error: string | null) => void
  clearError: () => void
}

type ProductsStore = ProductsState & ProductsActions

const initialFilters: ProductSearchFilters = {
  query: '',
  category: '',
  brand: '',
  dataSource: '',
  verified: undefined,
  hasAllergens: undefined
}

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      // State
      products: [],
      categories: [],
      currentProduct: null,
      searchResults: null,
      overview: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasMore: false
      },

      // Actions
      fetchProducts: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<PaginatedResponse<Product>>(
            `${API_ENDPOINTS.PRODUCTS.LIST}?page=${page}&limit=${limit}`
          )

          if (response.success) {
            set({
              products: response.data.items,
              pagination: response.data.pagination,
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to fetch products')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch products'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchProductsOverview: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<ProductsOverviewResponse>>(
            '/admin/products/overview'
          )

          if (response.success && response.data) {
            const { overview, categories, dataSources, products, pagination } = response.data
            set({
              overview,
              products,
              categories: categories.map(c => ({ name: c.category, count: c.count })),
              pagination: {
                page: Math.floor(pagination.offset / pagination.limit) + 1,
                limit: pagination.limit,
                total: pagination.total,
                pages: pagination.pages,
                hasMore: pagination.offset + pagination.limit < pagination.total
              },
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to fetch products overview')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch products overview'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchProduct: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<Product>>(
            API_ENDPOINTS.PRODUCTS.GET(id)
          )

          if (response.success && response.data) {
            const product = response.data
            set({
              currentProduct: product,
              isLoading: false
            })
            return product
          } else {
            throw new Error(response.message || 'Failed to fetch product')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch product'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      createProduct: async (data) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.post<ApiResponse<Product>>(
            API_ENDPOINTS.PRODUCTS.CREATE,
            data
          )

          if (response.success && response.data) {
            const newProduct = response.data
            set((state) => ({
              products: [newProduct, ...state.products],
              isLoading: false
            }))
            return newProduct
          } else {
            throw new Error(response.message || 'Failed to create product')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to create product'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      updateProduct: async (id: string, data) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.put<ApiResponse<Product>>(
            API_ENDPOINTS.PRODUCTS.UPDATE(id),
            data
          )

          if (response.success && response.data) {
            const updatedProduct = response.data
            set((state) => ({
              products: state.products.map(p =>
                p.id === id ? updatedProduct : p
              ),
              currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
              isLoading: false
            }))
            return updatedProduct
          } else {
            throw new Error(response.message || 'Failed to update product')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to update product'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.delete<ApiResponse<void>>(
            API_ENDPOINTS.PRODUCTS.DELETE(id)
          )

          if (response.success) {
            set((state) => ({
              products: state.products.filter(p => p.id !== id),
              currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
              isLoading: false
            }))
          } else {
            throw new Error(response.message || 'Failed to delete product')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to delete product'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      searchProducts: async (filters) => {
        set({ isLoading: true, error: null, filters })

        try {
          const params = new URLSearchParams()
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              params.append(key, String(value))
            }
          })

          const response = await apiClient.get<ApiResponse<ProductSearchResult>>(
            `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
          )

          if (response.success && response.data) {
            set({
              searchResults: response.data,
              products: response.data.products,
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to search products')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to search products'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      searchIntegrated: async (query: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<ProductSearchResult>>(
            `${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`
          )

          if (response.success && response.data) {
            const results = response.data
            set({
              searchResults: results,
              products: results.products,
              isLoading: false
            })
            return results
          } else {
            throw new Error(response.message || 'Failed to search products')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to search products'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchCategories: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<ProductCategory[]>>(
            API_ENDPOINTS.PRODUCTS.CATEGORIES
          )

          if (response.success && response.data) {
            set({
              categories: response.data,
              isLoading: false
            })
          } else {
            throw new Error(response.message || 'Failed to fetch categories')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch categories'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      fetchProductByBarcode: async (barcode: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.get<ApiResponse<Product>>(
            API_ENDPOINTS.PRODUCTS.BY_BARCODE(barcode)
          )

          if (response.success && response.data) {
            const product = response.data
            set({
              currentProduct: product,
              isLoading: false
            })
            return product
          } else {
            throw new Error(response.message || 'Product not found')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to fetch product by barcode'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      checkProductAllergies: async (productId: string, userId?: string) => {
        set({ isLoading: true, error: null })

        try {
          const url = userId
            ? `${API_ENDPOINTS.PRODUCTS.CHECK_ALLERGIES(productId)}?userId=${userId}`
            : API_ENDPOINTS.PRODUCTS.CHECK_ALLERGIES(productId)

          const response = await apiClient.get<ApiResponse<AllergyCheck>>(url)

          if (response.success && response.data) {
            set({ isLoading: false })
            return response.data
          } else {
            throw new Error(response.message || 'Failed to check allergies')
          }
        } catch (error: unknown) {
          const message = (error as Error)?.message || 'Failed to check allergies'
          set({
            error: message,
            isLoading: false
          })
          throw error
        }
      },

      setCurrentProduct: (product) => {
        set({ currentProduct: product })
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      clearFilters: () => {
        set({ filters: initialFilters })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'products-storage',
      partialize: (state) => ({
        filters: state.filters,
        categories: state.categories
      }),
    }
  )
)