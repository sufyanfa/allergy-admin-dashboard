// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    LIST: '/profiles/search',
    GET: '/profiles/me',
    UPDATE: '/profiles/me',
    ALLERGIES: '/profiles/me/allergies',
  },
  PRODUCTS: {
    LIST: '/products',
    GET: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    SEARCH: '/products/search/integrated',
    CATEGORIES: '/products/categories/list',
    CHECK_ALLERGIES: (id: string) => `/products/${id}/check-allergies`,
    BY_BARCODE: (barcode: string) => `/products/barcode/${barcode}`,
  },
  STATISTICS: {
    OVERVIEW: '/admin/dashboard/overview',
    KEY_METRICS: '/admin/dashboard/overview',
    SYSTEM_HEALTH: '/admin/system/health',
    REALTIME_METRICS: '/admin/metrics/realtime',
    EXPORT: '/admin/dashboard/export',
    USERS: {
      BASE: '/admin/statistics/users',
      OVERVIEW: '/admin/statistics/users/overview',
      GROWTH: (period: string) => `/admin/statistics/users/growth?period=${period}`,
      DEMOGRAPHICS: '/admin/statistics/users/demographics',
    },
    PRODUCTS: {
      BASE: '/admin/statistics/products',
      OVERVIEW: '/admin/statistics/products/overview',
      CATEGORIES: '/admin/statistics/products/categories',
      DATA_SOURCES: '/admin/statistics/products/data-sources',
      QUALITY: '/admin/statistics/products/quality',
      GROWTH: (period: string) => `/admin/statistics/products/growth?period=${period}`,
    },
    ACTIVITY: {
      BASE: '/admin/statistics/activity',
      OVERVIEW: '/admin/statistics/activity/overview',
      SEARCHES: '/admin/statistics/activity/searches',
      CONTRIBUTIONS: '/admin/statistics/activity/contributions',
      EXPERIENCES: '/admin/statistics/activity/experiences',
    },
    CACHE: {
      CLEAR_USERS: '/admin/statistics/cache/users',
      CLEAR_PRODUCTS: '/admin/statistics/cache/products',
      CLEAR_ACTIVITY: '/admin/statistics/cache/activity',
      CLEAR_ALL: '/admin/statistics/cache/all',
    },
  },
} as const

// Navigation Menu Items
export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'BarChart3',
  },
  {
    title: 'Users',
    href: '/users',
    icon: 'Users',
  },
  {
    title: 'Products',
    href: '/products',
    icon: 'Package',
  },
  {
    title: 'Allergies',
    href: '/allergies',
    icon: 'AlertTriangle',
  },
] as const

// User Roles and Permissions
export const USER_ROLES = {
  USER: 'user',
  PREMIUM: 'premium',
  ADMIN: 'admin',
} as const

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const

