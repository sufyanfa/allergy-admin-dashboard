// RBAC Types
export type UserRole = 'user' | 'company' | 'doctor' | 'hospital' | 'admin'

export type AppPermission =
  | 'profile.read'
  | 'profile.update'
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.review'
  | 'products.approve'
  | 'allergies.read'
  | 'allergies.create'
  | 'allergies.update'
  | 'allergies.delete'
  | 'community.read'
  | 'community.participate'
  | 'community.moderate'
  | 'experiments.read'
  | 'experiments.participate'
  | 'experiments.manage'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.manage_roles'
  | 'system.read'
  | 'system.configure'
  | 'system.analytics'

export interface RolePermission {
  role: UserRole
  permission: AppPermission
}

export interface UserPermissionContext {
  id: string
  email?: string
  phone?: string
  role: UserRole
  permissions?: AppPermission[]
}

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
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  isPublicProfile: boolean
  allowContactViaEmail: boolean
  onboardingCompleted: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  allergiesCount?: number
  permissions?: AppPermission[]
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

// Contribution Types
export type ContributionStatus = 'pending' | 'approved' | 'rejected'
export type ContributionType = 'new_product' | 'edit_ingredients' | 'add_image' | 'report_error'

export interface ContributionData {
  barcode?: string
  frontImageUrl?: string
  ingredientsImageUrl?: string
  extractedIngredientsAr?: string
  extractedIngredientsEn?: string
  productNameAr?: string
  productNameEn?: string
  brandAr?: string
  brandEn?: string
  category?: string
  aiConfidence?: number
  // For edit_ingredients type
  newIngredientsAr?: string
  newIngredientsEn?: string
  // For report_error type
  reportDescription?: string
  reportType?: string
  // For add_image type
  imageType?: 'front' | 'ingredients' | 'nutrition'
  imageUrl?: string
}

export interface Contribution {
  id: string
  userId: string
  productId: string | null
  contributionType: ContributionType
  contributionData: ContributionData
  status: ContributionStatus
  reviewedBy: string | null
  reviewedAt: string | null
  notes: string | null
  createdAt: string
  user: {
    id: string
    name: string
    username: string
  }
  product: {
    id: string
    nameAr: string
    nameEn: string
    barcode: string
  } | null
}

export interface ContributionsOverview {
  totalContributions: number
  pendingContributions: number
  approvedContributions: number
  rejectedContributions: number
  typeDistribution: Array<{ type: string; count: number }>
}

export interface ContributionsFilters {
  search?: string
  status?: ContributionStatus
  contributionType?: ContributionType
  userId?: string
  limit?: number
  offset?: number
}

export interface ContributionsOverviewResponse {
  overview: ContributionsOverview
  contributions: Contribution[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

export interface ContributionStatusUpdate {
  status: ContributionStatus
  notes?: string
}

export interface ContributionStatusUpdateResponse {
  contributionId: string
  productId: string | null
}

export interface BulkUpdateRequest {
  contributionIds: string[]
  status: ContributionStatus
  notes?: string
}

export interface BulkUpdateResponse {
  succeeded: number
  failed: number
  errors: Array<{ id: string; error: string }>
  productIds: string[]
}

// RBAC API Response Types
export interface RolePermissionsResponse {
  success: boolean
  data: {
    role: UserRole
    permissions: AppPermission[]
  }
}

export interface AllRolePermissionsResponse {
  success: boolean
  data: {
    roles: Array<{
      role: UserRole
      permissions: AppPermission[]
      permissionCount: number
    }>
  }
}

export interface UpdateRolePermissionsRequest {
  role: UserRole
  permissions: AppPermission[]
}

export interface AddRolePermissionRequest {
  role: UserRole
  permission: AppPermission
}

export interface RemoveRolePermissionRequest {
  role: UserRole
  permission: AppPermission
}

export interface UpdateUserRoleRequest {
  userId: string
  role: UserRole
}

export interface UserRoleUpdateResponse {
  success: boolean
  data: {
    userId: string
    role: UserRole
    permissions: AppPermission[]
  }
}

// Permission Checking
export interface PermissionCheckResult {
  hasPermission: boolean
  requiredPermission: AppPermission
  userPermissions: AppPermission[]
}

// Analytics Types
export type AnalyticsPeriod = 'all' | 'day' | 'week' | 'month'

export interface AnalyticsSummary {
  totalSearches: number
  uniqueProductsSearched: number
  uniqueSearchQueries: number
  barcodeSearches: number
  textSearches: number
  safeResults: number
  unsafeResults: number
}

export interface SearchedProduct {
  productId: string
  barcode: string
  nameAr: string
  nameEn: string | null
  brandAr: string
  brandEn: string | null
  category: string
  searchCount: number
  viewCount: number
  popularityScore: number
  imageUrl: string | null
}

export interface TopSearchQuery {
  id: string
  query: string
  searchCount: number
  resultFoundCount: number
  noResultCount: number
}

export interface AnalyticsDashboardData {
  summary: AnalyticsSummary
  mostSearchedProducts: SearchedProduct[]
  mostPopularProducts: SearchedProduct[]
  topSearchQueries: TopSearchQuery[]
}

export interface AnalyticsDashboardResponse {
  success: boolean
  data: AnalyticsDashboardData
}

export interface SearchedProductsResponse {
  success: boolean
  data: {
    products: SearchedProduct[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

export interface TopQueriesResponse {
  success: boolean
  data: {
    queries: TopSearchQuery[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

export interface ProductAnalyticsData {
  product: SearchedProduct
  searchHistory: Array<{
    date: string
    count: number
  }>
  viewHistory: Array<{
    date: string
    count: number
  }>
  popularityHistory: Array<{
    date: string
    score: number
  }>
}

export interface ProductAnalyticsResponse {
  success: boolean
  data: ProductAnalyticsData
}

