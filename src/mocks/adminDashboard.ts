import type { PlatformAnalytics, RevenueChartData, UserAnalytics, ChartDataPoint } from '../types/auditLog';

// Mock analytics data
export const mockPlatformAnalytics: PlatformAnalytics = {
  totalUsers: 1248,
  activeSellers: 83,
  pendingApplications: 12,
  totalRevenue: 125000,
  monthlyRevenue: 15000,
  weeklyRevenue: 3500,
  dailyRevenue: 500,
  platformCommission: 12500,
  pendingPayouts: 2500,
  totalRequests: 450,
  completedRequests: 380,
  cancelledRequests: 45,
  averageRequestValue: 180,
  userGrowthRate: 12.5,
  revenueGrowthRate: 8.3
};

// Mock revenue chart data
export const mockRevenueChartData: RevenueChartData = {
  daily: [
    { date: '2024-01-09', value: 450 },
    { date: '2024-01-10', value: 520 },
    { date: '2024-01-11', value: 480 },
    { date: '2024-01-12', value: 600 },
    { date: '2024-01-13', value: 550 },
    { date: '2024-01-14', value: 680 },
    { date: '2024-01-15', value: 500 }
  ],
  weekly: [
    { date: '2024-01-01', value: 2800 },
    { date: '2024-01-08', value: 3200 },
    { date: '2024-01-15', value: 3500 }
  ],
  monthly: [
    { date: '2023-10', value: 12000 },
    { date: '2023-11', value: 13500 },
    { date: '2023-12', value: 14200 },
    { date: '2024-01', value: 15000 }
  ],
  byCategory: [
    { category: 'Plumber', revenue: 25000, count: 45 },
    { category: 'Electrician', revenue: 22000, count: 38 },
    { category: 'HVAC', revenue: 18000, count: 32 },
    { category: 'Cleaning', revenue: 15000, count: 55 },
    { category: 'Painter', revenue: 12000, count: 28 },
    { category: 'Welder', revenue: 10000, count: 15 },
    { category: 'Carpenter', revenue: 8000, count: 22 },
    { category: 'Technician', revenue: 7000, count: 18 }
  ]
};

// Mock user analytics
export const mockUserAnalytics: UserAnalytics = {
  totalUsers: 1248,
  newUsersToday: 12,
  newUsersThisWeek: 85,
  newUsersThisMonth: 320,
  activeUsers: 950,
  blockedUsers: 15,
  verifiedSellers: 75,
  pendingSellers: 12,
  userGrowthTrend: [
    { date: '2024-01-09', value: 8 },
    { date: '2024-01-10', value: 12 },
    { date: '2024-01-11', value: 15 },
    { date: '2024-01-12', value: 18 },
    { date: '2024-01-13', value: 14 },
    { date: '2024-01-14', value: 16 },
    { date: '2024-01-15', value: 12 }
  ]
};

// Mock activity data for charts
export const mockActivityData = [
  { name: 'Mon', users: 12, services: 5, revenue: 450 },
  { name: 'Tue', users: 18, services: 7, revenue: 520 },
  { name: 'Wed', users: 22, services: 10, revenue: 480 },
  { name: 'Thu', users: 20, services: 9, revenue: 600 },
  { name: 'Fri', users: 28, services: 13, revenue: 550 },
  { name: 'Sat', users: 24, services: 11, revenue: 680 },
  { name: 'Sun', users: 16, services: 8, revenue: 500 }
];

// Mock request status distribution
export const mockRequestStatusData = [
  { name: 'Completed', value: 380, color: '#22c55e' },
  { name: 'Pending', value: 25, color: '#f59e0b' },
  { name: 'Cancelled', value: 45, color: '#ef4444' }
];

// Mock top sellers data
export const mockTopSellers = [
  {
    id: 'seller-001',
    name: 'Mike Smith',
    category: 'Plumber',
    rating: 4.9,
    completedJobs: 125,
    totalEarnings: 18750,
    thisMonthEarnings: 2250
  },
  {
    id: 'seller-002',
    name: 'Sarah Chen',
    category: 'Electrician',
    rating: 4.8,
    completedJobs: 98,
    totalEarnings: 19600,
    thisMonthEarnings: 2100
  },
  {
    id: 'seller-003',
    name: 'David Rodriguez',
    category: 'Cleaning',
    rating: 4.7,
    completedJobs: 156,
    totalEarnings: 12480,
    thisMonthEarnings: 1800
  },
  {
    id: 'seller-004',
    name: 'Lisa Anderson',
    category: 'Painter',
    rating: 4.6,
    completedJobs: 87,
    totalEarnings: 17400,
    thisMonthEarnings: 1950
  },
  {
    id: 'seller-005',
    name: 'Tom Wilson',
    category: 'Welder',
    rating: 4.9,
    completedJobs: 45,
    totalEarnings: 18000,
    thisMonthEarnings: 2400
  }
];

// Helper functions
export const generateTimeSeriesData = (days: number, baseValue: number, variance: number = 0.2): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    const value = Math.round(baseValue * randomFactor);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value
    });
  }
  
  return data;
};

export const getRevenueByTimeframe = (timeframe: 'daily' | 'weekly' | 'monthly') => {
  switch (timeframe) {
    case 'daily':
      return mockRevenueChartData.daily;
    case 'weekly':
      return mockRevenueChartData.weekly;
    case 'monthly':
      return mockRevenueChartData.monthly;
    default:
      return mockRevenueChartData.daily;
  }
};

export const getTopCategoriesByRevenue = (limit: number = 5) => {
  return mockRevenueChartData.byCategory
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

export const getTopSellersByEarnings = (limit: number = 5) => {
  return mockTopSellers
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, limit);
};
