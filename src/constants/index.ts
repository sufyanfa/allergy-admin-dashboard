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
  ALLERGIES: {
    LIST: '/allergies',
    GET: (id: string) => `/allergies/${id}`,
    CREATE: '/allergies',
    UPDATE: (id: string) => `/allergies/${id}`,
    DELETE: (id: string) => `/allergies/${id}`,
    OVERVIEW: '/admin/allergies/overview',
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
  CONTRIBUTIONS: {
    OVERVIEW: '/admin/contributions/overview',
    GET: (id: string) => `/admin/contributions/${id}`,
    UPDATE: (id: string) => `/admin/contributions/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/contributions/${id}/status`,
    BULK_UPDATE: '/admin/contributions/bulk-update',
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
  ANALYTICS: {
    DASHBOARD: '/admin/analytics/dashboard',
    MOST_SEARCHED: '/admin/analytics/most-searched',
    MOST_POPULAR: '/admin/analytics/most-popular',
    TOP_QUERIES: '/admin/analytics/top-queries',
    SUMMARY: '/admin/analytics/summary',
    PRODUCT: (productId: string) => `/admin/analytics/products/${productId}`,
  },
  REPORTS: {
    LIST: '/admin/reports',
    RESOLVE: (id: string) => `/admin/reports/${id}/resolve`,
    DISMISS: (id: string) => `/admin/reports/${id}/dismiss`,
  },
} as const

// Navigation Menu Items
export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    translationKey: 'dashboard',
    href: '/dashboard',
    icon: 'BarChart3',
  },
  {
    title: 'Users',
    translationKey: 'users',
    href: '/users',
    icon: 'Users',
  },
  {
    title: 'Products',
    translationKey: 'products',
    href: '/products',
    icon: 'Package',
  },
  {
    title: 'Lists',
    translationKey: 'lists',
    href: '/lists',
    icon: 'List',
  },
  {
    title: 'Allergies',
    translationKey: 'allergies',
    href: '/allergies',
    icon: 'AlertTriangle',
  },
  {
    title: 'Groups',
    translationKey: 'groups',
    href: '/groups',
    icon: 'MessageSquare',
  },
  {
    title: 'Contributions',
    translationKey: 'contributions',
    href: '/contributions',
    icon: 'GitPullRequest',
  },
  {
    title: 'Analytics',
    translationKey: 'analytics',
    href: '/analytics',
    icon: 'TrendingUp',
  },
  {
    title: 'Reports',
    translationKey: 'reports',
    href: '/reports',
    icon: 'Flag',
  },
] as const

// User Roles and Permissions
export const USER_ROLES = {
  USER: 'user',
  COMPANY: 'company',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital',
  ADMIN: 'admin',
} as const

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const

// RBAC Permission Categories
export const PERMISSION_CATEGORIES = {
  PROFILE: 'Profile Management',
  PRODUCTS: 'Product Management',
  ALLERGIES: 'Allergy Management',
  COMMUNITY: 'Community Management',
  EXPERIMENTS: 'Experiment Management',
  USERS: 'User Management',
  SYSTEM: 'System Management',
} as const

// Permission Descriptions
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'profile.read': 'View user profiles',
  'profile.update': 'Update user profiles',
  'products.read': 'View products',
  'products.create': 'Create new products',
  'products.update': 'Update existing products',
  'products.delete': 'Delete products',
  'products.review': 'Review product submissions',
  'products.approve': 'Approve product submissions',
  'allergies.read': 'View allergies',
  'allergies.create': 'Create new allergies',
  'allergies.update': 'Update existing allergies',
  'allergies.delete': 'Delete allergies',
  'community.read': 'View community content',
  'community.participate': 'Participate in community',
  'community.moderate': 'Moderate community content',
  'experiments.read': 'View experiments',
  'experiments.participate': 'Participate in experiments',
  'experiments.manage': 'Manage experiments',
  'users.read': 'View user information',
  'users.update': 'Update user information',
  'users.delete': 'Delete users',
  'users.manage_roles': 'Manage user roles',
  'system.read': 'View system settings',
  'system.configure': 'Configure system settings',
  'system.analytics': 'View system analytics',
} as const

// Role Display Names
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  user: 'User',
  company: 'Company',
  doctor: 'Doctor',
  hospital: 'Hospital',
  admin: 'Administrator',
} as const

// Role Colors (for badges)
export const ROLE_COLORS: Record<string, string> = {
  user: 'bg-blue-100 text-blue-800',
  company: 'bg-purple-100 text-purple-800',
  doctor: 'bg-green-100 text-green-800',
  hospital: 'bg-teal-100 text-teal-800',
  admin: 'bg-red-100 text-red-800',
} as const

