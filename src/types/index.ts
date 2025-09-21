// User Types
export interface User {
  id: string
  name?: string // Alias for fullName for backward compatibility
  fullName?: string
  username?: string
  email?: string
  phone?: string
  avatarUrl?: string
  bio?: string
  website?: string
  location?: string
  language: string
  timezone?: string
  role: 'user' | 'premium' | 'admin' | 'authenticated'
  status: 'active' | 'inactive' | 'suspended'
  isPublicProfile: boolean
  allowContactViaEmail: boolean
  onboardingCompleted: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  allergiesCount?: number
  createdAt: string
  updatedAt: string
}


// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  message?: string
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
      hasMore: boolean
    }
  }
}

// Product Types
export interface Product {
  id: string
  barcode: string
  nameAr: string
  nameEn?: string
  brandAr: string
  brandEn?: string
  category: string
  subcategory?: string
  imageUrl?: string
  countryOfOrigin?: string
  dataSource: 'api' | 'manual' | 'community'
  verified: boolean
  confidenceScore: number
  createdAt: string
  updatedAt: string
  ingredients?: Ingredient[]
}

export interface Ingredient {
  id?: string // Optional for creation, assigned by backend
  nameAr: string
  nameEn: string
  isAllergen?: boolean // Optional, determined by backend
  allergenType?: string // Optional, determined by backend
  orderIndex?: number
}

// For API requests when creating products
export interface IngredientInput {
  nameAr: string
  nameEn: string
  orderIndex?: number
}

export interface ProductInput {
  barcode: string
  nameAr: string
  nameEn?: string
  brandAr: string
  brandEn?: string
  category: string
  subcategory?: string
  imageUrl?: string
  countryOfOrigin?: string
  dataSource: 'api' | 'manual' | 'community'
  ingredients?: IngredientInput[]
}

export interface ProductCategory {
  id: string
  nameAr: string
  nameEn: string
  description?: string
  parentId?: string
  isActive: boolean
}

export interface Allergy {
  id: string
  nameAr: string
  nameEn?: string
  descriptionAr?: string
  descriptionEn?: string
  severity: 'mild' | 'moderate' | 'severe'
  isActive: boolean
  userCount?: number
  createdAt: string
  updatedAt?: string
}

export interface AllergyCheck {
  hasAllergies: boolean
  allergies: {
    id: string
    nameAr: string
    nameEn: string
    severity: 'mild' | 'moderate' | 'severe'
    ingredients: string[]
  }[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export interface ProductSearchFilters {
  query?: string
  category?: string
  brand?: string
  dataSource?: string
  verified?: boolean
  hasAllergens?: boolean
}

export interface ProductSearchResult {
  products: Product[]
  totalCount: number
  categories: ProductCategory[]
  brands: string[]
}

export interface ProductsOverview {
  totalProducts: number
  verifiedProducts: number
  categoriesCount: number
  dataSourcesCount: number
}

export interface ProductsOverviewResponse {
  overview: ProductsOverview
  categories: Array<{ category: string; count: number }>
  dataSources: Array<{ source: string; count: number }>
  products: Product[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

export interface AllergiesOverview {
  totalAllergies: number
  activeAllergies: number
  severityDistribution: {
    mild: number
    moderate: number
    severe: number
  }
  userAllergiesCount: number
}

export interface AllergiesOverviewResponse {
  overview: AllergiesOverview
  allergies: Allergy[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

export interface UsersOverview {
  totalUsers: {
    count: number
    growthPercentage: number
  }
  activeUsers: {
    count: number
    percentage: number
  }
  premiumUsers: {
    count: number
    percentage: number
  }
  roleDistribution: Array<{
    role: string
    count: number
    percentage: number
  }>
}

export interface UsersOverviewResponse {
  overview: UsersOverview
  users: User[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

// Statistics Types
export interface DashboardOverview {
  users: {
    total: number
    active: number
    newToday: number
    growthRate: number
  }
  products: {
    total: number
    verified: number
    newToday: number
    categoriesCount: number
  }
  activity: {
    totalSearches: number
    searchesToday: number
    avgResponseTime: number
    contributionsToday: number
  }
  system: {
    uptime: number
    lastRestart: string
  }
}

export interface KeyMetrics {
  totalUsers: number
  activeUsers: number
  totalProducts: number
  verifiedProducts: number
  totalSearches: number
  totalContributions: number
  avgSearchTime: number
  userGrowthRate: number
  productGrowthRate: number
  systemUptime: number
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  timestamp: string
  responseTime: number
  uptime: number
  lastUpdated: string
  memoryUsage: number
  cpuUsage: number
  cacheHitRate: number
  avgResponseTime: number
  errorRate: number
  database: {
    status: 'healthy' | 'degraded'
    responseTime: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
}

export interface UserStatistics {
  overview: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    suspendedUsers: number
    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    growthRate: number
  }
  demographics: {
    byLanguage: Array<{ language: string; count: number; percentage: number }>
    byRole: Array<{ role: string; count: number; percentage: number }>
    byStatus: Array<{ status: string; count: number; percentage: number }>
    byLocation: Array<{ country: string; count: number; percentage: number }>
  }
}

export interface GrowthData {
  period: 'daily' | 'weekly' | 'monthly'
  data: Array<{
    date: string
    value: number
    cumulative: number
  }>
  totalGrowth: number
  periodGrowth: number
}

export interface ProductStatistics {
  overview: {
    totalProducts: number
    verifiedProducts: number
    unverifiedProducts: number
    newProductsToday: number
    newProductsThisWeek: number
    newProductsThisMonth: number
    avgConfidenceScore: number
    categoriesCount: number
  }
  categories: Array<{
    category: string
    count: number
    percentage: number
    verified: number
    avgConfidence: number
  }>
  dataSources: Array<{
    source: 'api' | 'manual' | 'community'
    count: number
    percentage: number
    avgConfidence: number
  }>
  quality: {
    highConfidence: number
    mediumConfidence: number
    lowConfidence: number
    avgConfidenceScore: number
    verificationRate: number
  }
}

export interface ActivityStatistics {
  overview: {
    totalSearches: number
    searchesToday: number
    searchesThisWeek: number
    searchesThisMonth: number
    avgSearchTime: number
    totalContributions: number
    contributionsToday: number
    contributionsThisWeek: number
    contributionsThisMonth: number
    avgContributionsPerUser: number
  }
  searches: {
    byType: Array<{ type: string; count: number; percentage: number }>
    byResult: Array<{ result: string; count: number; percentage: number }>
    avgResponseTime: number
    popularQueries: Array<{ query: string; count: number }>
  }
  contributions: {
    byType: Array<{ type: string; count: number; percentage: number }>
    byStatus: Array<{ status: string; count: number; percentage: number }>
    topContributors: Array<{
      userId: string
      username: string
      contributionsCount: number
    }>
  }
  experiences: {
    totalReports: number
    byReaction: Array<{ reaction: string; count: number; percentage: number }>
    bySeverity: Array<{ severity: string; count: number; percentage: number }>
    avgRating: number
  }
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }>
}

export interface StatisticsPeriod {
  daily: GrowthData
  weekly: GrowthData
  monthly: GrowthData
}

// API Response Types for Statistics
export interface StatisticsApiResponse {
  success: boolean
  message: string
  data: {
    overview: {
      totalUsers: { count: number; growthPercentage: number }
      totalProducts: { count: number; growthPercentage: number }
      totalSearches: { count: number; growthPercentage: number }
      systemUptime: { percentage: number; lastRestart: string }
    }
    realtime: {
      searchesToday: number
      avgSearchTimeMs: number
      contributionsToday: number
      verifiedProductsPercentage: number
    }
    charts: {
      userGrowth: Array<{ date: string; count: number }>
      productGrowth: Array<{ date: string; count: number }>
      userRoleDistribution: Array<{ role: string; count: number; percentage: number }>
      productCategories: Array<{ category: string; count: number; percentage: number }>
      productDataSources: Array<{ source: string; count: number; percentage: number }>
    }
  }
}

export interface SystemHealthApiResponse {
  success: boolean
  status: 'healthy' | 'degraded'
  timestamp: string
  responseTime: number
  checks: {
    database: { status: 'healthy' | 'degraded'; responseTime: number }
    memory: { heapUsed: number; heapTotal: number }
    uptime: number
  }
}

