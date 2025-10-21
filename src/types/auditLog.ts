export type AuditLogEntry = {
  id: string;
  adminId: string;
  adminName: string;
  action: string; // 'user_blocked', 'role_changed', 'request_cancelled', etc.
  targetType: 'user' | 'request' | 'transaction' | 'category' | 'setting';
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
};

export type AuditLogFilters = {
  dateRange?: {
    start: string;
    end: string;
  };
  adminId?: string;
  action?: string;
  targetType?: AuditLogEntry['targetType'];
};

export type PlatformAnalytics = {
  totalUsers: number;
  activeSellers: number;
  pendingApplications: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  platformCommission: number;
  pendingPayouts: number;
  totalRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  averageRequestValue: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
};

export type ChartDataPoint = {
  date: string;
  value: number;
  label?: string;
};

export type RevenueChartData = {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
  byCategory: Array<{
    category: string;
    revenue: number;
    count: number;
  }>;
};

export type UserAnalytics = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  blockedUsers: number;
  verifiedSellers: number;
  pendingSellers: number;
  userGrowthTrend: ChartDataPoint[];
};
