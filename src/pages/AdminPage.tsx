import React from 'react';
import { useAuth } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MetricCard } from '../components/admin/MetricCard';
import { DataTable } from '../components/admin/DataTable';
import { DateRangePicker } from '../components/admin/DateRangePicker';
import { ExportButton, convertToCSV } from '../components/admin/ExportButton';
import { mockPlatformAnalytics, mockRevenueChartData, mockActivityData, mockRequestStatusData, mockTopSellers } from '../mocks/adminDashboard';
import { mockTransactions, getTransactionSummary, filterTransactions } from '../mocks/transactions';
import { mockAuditLogs, filterAuditLogs } from '../mocks/transactions';
import { SERVICE_CATEGORIES } from '../mocks/sellerProfile';
import type { Transaction, TransactionFilters } from '../types/transaction';
import type { AuditLogEntry, AuditLogFilters } from '../types/auditLog';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  lastLogin: string;
  verified: boolean;
  totalRequests: number;
  completedJobs: number;
  totalEarnings: number;
};

const demoUsers: UserRecord[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', status: 'active', createdAt: '2024-01-01', lastLogin: '2024-01-15', verified: true, totalRequests: 5, completedJobs: 0, totalEarnings: 0 },
  { id: '2', name: 'Bob Wilson', email: 'bob@example.com', role: 'seller', status: 'pending', createdAt: '2024-01-10', lastLogin: '2024-01-14', verified: false, totalRequests: 0, completedJobs: 0, totalEarnings: 0 },
  { id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'seller', status: 'active', createdAt: '2024-01-05', lastLogin: '2024-01-15', verified: true, totalRequests: 0, completedJobs: 25, totalEarnings: 4500 },
  { id: '4', name: 'Dave Miller', email: 'dave@example.com', role: 'user', status: 'blocked', createdAt: '2023-12-20', lastLogin: '2024-01-10', verified: false, totalRequests: 2, completedJobs: 0, totalEarnings: 0 },
];

type TabType = 'overview' | 'users' | 'requests' | 'transactions' | 'categories' | 'settings' | 'audit-logs';

export const AdminPage: React.FC = () => {
  const { loginAs, role } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  
  // Users tab state
  const [users, setUsers] = React.useState<UserRecord[]>(demoUsers);
  const [userSearch, setUserSearch] = React.useState('');
  const [userRoleFilter, setUserRoleFilter] = React.useState<'all' | 'user' | 'seller' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = React.useState<'all' | 'active' | 'blocked' | 'pending'>('all');
  const [selectedUsers, setSelectedUsers] = React.useState<UserRecord[]>([]);
  const [userPage, setUserPage] = React.useState(1);
  const [userPageSize, setUserPageSize] = React.useState(10);
  
  // Transactions tab state
  const [transactions] = React.useState<Transaction[]>(mockTransactions);
  const [transactionFilters, setTransactionFilters] = React.useState<TransactionFilters>({});
  const [transactionPage, setTransactionPage] = React.useState(1);
  const [transactionPageSize, setTransactionPageSize] = React.useState(10);
  
  // Audit logs tab state
  const [auditLogs] = React.useState<AuditLogEntry[]>(mockAuditLogs);
  const [auditFilters, setAuditFilters] = React.useState<AuditLogFilters>({});
  
  // Categories tab state
  const [categories] = React.useState(SERVICE_CATEGORIES);
  const [categorySearch, setCategorySearch] = React.useState('');
  
  // Settings tab state
  const [settings, setSettings] = React.useState({
    platformCommission: 10,
    minServicePrice: 10,
    maxServicePrice: 10000,
    instantRequestExpiry: 24,
    maxBroadcastRadius: 50,
    maintenanceMode: false,
    requireSellerVerification: true,
    enableNotifications: true
  });

  // Filtered data
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !userSearch || 
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredTransactions = React.useMemo(() => {
    return filterTransactions(transactions, transactionFilters);
  }, [transactions, transactionFilters]);

  const filteredAuditLogs = React.useMemo(() => {
    return filterAuditLogs(auditLogs, auditFilters);
  }, [auditLogs, auditFilters]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter(category =>
      !categorySearch || category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const transactionSummary = React.useMemo(() => {
    return getTransactionSummary(filteredTransactions);
  }, [filteredTransactions]);

  // Tab icons
  const getTabIcon = (tabId: string) => {
    const iconClass = "w-5 h-5";
    switch (tabId) {
      case 'overview':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'requests':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'transactions':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'categories':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'audit-logs':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'requests', label: 'Requests' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'categories', label: 'Categories' },
    { id: 'settings', label: 'Settings' },
    { id: 'audit-logs', label: 'Audit Logs' }
  ];

  // User actions
  const handleUserAction = (action: string, userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'block':
            return { ...user, status: 'blocked' };
          case 'unblock':
            return { ...user, status: 'active' };
          case 'verify':
            return { ...user, verified: true };
          case 'unverify':
            return { ...user, verified: false };
          case 'promote-admin':
            return { ...user, role: 'admin' };
          case 'demote-user':
            return { ...user, role: 'user' };
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const handleBulkUserAction = (action: string) => {
    setUsers(prev => prev.map(user => {
      if (selectedUsers.some(selected => selected.id === user.id)) {
        switch (action) {
          case 'block':
            return { ...user, status: 'blocked' };
          case 'unblock':
            return { ...user, status: 'active' };
          case 'verify':
            return { ...user, verified: true };
          case 'delete':
            return null;
          default:
            return user;
        }
      }
      return user;
    }).filter(Boolean) as UserRecord[]);
    setSelectedUsers([]);
  };

  // Export functions
  const handleExportUsers = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      convertToCSV(filteredUsers, 'users');
    }
  };

  const handleExportTransactions = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      convertToCSV(filteredTransactions, 'transactions');
    }
  };

  const handleExportAuditLogs = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      convertToCSV(filteredAuditLogs, 'audit-logs');
    }
  };

  // User table columns
  const userColumns = [
    { key: 'name' as keyof UserRecord, label: 'Name', sortable: true },
    { key: 'email' as keyof UserRecord, label: 'Email', sortable: true },
    { 
      key: 'role' as keyof UserRecord, 
      label: 'Role', 
      sortable: true,
      render: (value: string, row: UserRecord) => (
        <select
          value={value}
          onChange={(e) => handleUserAction(`promote-${e.target.value}`, row.id)}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm dark:bg-slate-800"
        >
          <option value="user">User</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      )
    },
    { 
      key: 'status' as keyof UserRecord, 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
          value === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'verified' as keyof UserRecord, 
      label: 'Verified', 
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          value ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    { key: 'totalRequests' as keyof UserRecord, label: 'Requests', sortable: true },
    { key: 'completedJobs' as keyof UserRecord, label: 'Jobs', sortable: true },
    { 
      key: 'totalEarnings' as keyof UserRecord, 
      label: 'Earnings', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    }
  ];

  // Transaction table columns
  const transactionColumns = [
    { key: 'id' as keyof Transaction, label: 'ID', sortable: true },
    { key: 'buyerName' as keyof Transaction, label: 'Buyer', sortable: true },
    { key: 'sellerName' as keyof Transaction, label: 'Seller', sortable: true },
    { key: 'categoryName' as keyof Transaction, label: 'Category', sortable: true },
    { 
      key: 'serviceAmount' as keyof Transaction, 
      label: 'Amount', 
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'platformCommission' as keyof Transaction, 
      label: 'Commission', 
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'paymentMethod' as keyof Transaction, 
      label: 'Payment', 
      sortable: true,
      render: (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')
    },
    { 
      key: 'status' as keyof Transaction, 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
          value === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
          value === 'refunded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 
          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'createdAt' as keyof Transaction, 
      label: 'Date', 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  // Audit log table columns
  const auditLogColumns = [
    { key: 'timestamp' as keyof AuditLogEntry, label: 'Time', sortable: true, render: (value: string) => new Date(value).toLocaleString() },
    { key: 'adminName' as keyof AuditLogEntry, label: 'Admin', sortable: true },
    { key: 'action' as keyof AuditLogEntry, label: 'Action', sortable: true },
    { key: 'targetType' as keyof AuditLogEntry, label: 'Target', sortable: true },
    { key: 'targetId' as keyof AuditLogEntry, label: 'Target ID', sortable: true },
    { key: 'details' as keyof AuditLogEntry, label: 'Details', sortable: true },
    { key: 'ipAddress' as keyof AuditLogEntry, label: 'IP', sortable: true }
  ];

  return (
    <section className="max-w-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Complete platform management and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-300">Current role: {role}</span>
          <div className="flex gap-1">
            <button className="rounded-md border px-2 py-1 text-sm" onClick={() => loginAs('admin')}>Login as Admin</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={() => loginAs('buyer')}>Login as Buyer</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={() => loginAs('seller')}>Login as Seller</button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {getTabIcon(tab.id)}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={`$${mockPlatformAnalytics.totalRevenue.toLocaleString()}`}
                  subtitle="All time"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 9v3m0 3.01V21M6 12H3.5c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1H6m0-4h7.5c.552 0 1 .448 1 1v3c0 .552-.448 1-1 1H6m-1.5-4L6 17.5V12M4 17h-.5c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1H4m0-4h7.5c.552 0 1 .448 1 1v3c0 .552-.448 1-1 1H4" />
                    </svg>
                  }
                  trend="up"
                  trendValue="+8.3%"
                  color="success"
                />
                <MetricCard
                  title="Total Users"
                  value={mockPlatformAnalytics.totalUsers.toLocaleString()}
                  subtitle="Registered users"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  }
                  trend="up"
                  trendValue="+12.5%"
                  color="info"
                />
                <MetricCard
                  title="Active Sellers"
                  value={mockPlatformAnalytics.activeSellers}
                  subtitle="Verified professionals"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  }
                  color="primary"
                />
                <MetricCard
                  title="Platform Commission"
                  value={`$${mockPlatformAnalytics.platformCommission.toLocaleString()}`}
                  subtitle="Total earned"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                  color="warning"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 7 Days)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockRevenueChartData.daily}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Request Status Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Request Status Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockRequestStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {mockRequestStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Activity Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
                <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
              <Bar dataKey="services" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

              {/* Top Sellers */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Top Sellers by Earnings</h3>
                <div className="space-y-3">
                  {mockTopSellers.slice(0, 5).map((seller, index) => (
                    <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </div>
          <div>
                          <p className="font-medium">{seller.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{seller.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${seller.totalEarnings.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{seller.completedJobs} jobs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters and Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  <div className="flex-1">
            <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                  >
              <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Admins</option>
            </select>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                  >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="pending">Pending</option>
            </select>
                  <ExportButton onExport={handleExportUsers} />
        </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleBulkUserAction('block')}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Block Selected ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => handleBulkUserAction('unblock')}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Unblock Selected
                    </button>
                    <button
                      onClick={() => handleBulkUserAction('verify')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Verify Selected
                    </button>
                  </div>
                )}

                {/* Users Table */}
                <DataTable
                  data={filteredUsers}
                  columns={userColumns}
                  selectable
                  onSelectionChange={setSelectedUsers}
                  pagination={{
                    page: userPage,
                    pageSize: userPageSize,
                    total: filteredUsers.length,
                    onPageChange: setUserPage,
                    onPageSizeChange: setUserPageSize
                  }}
                />
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={`$${transactionSummary.totalRevenue.toLocaleString()}`}
                  subtitle="From completed transactions"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 9v3m0 3.01V21M6 12H3.5c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1H6m0-4h7.5c.552 0 1 .448 1 1v3c0 .552-.448 1-1 1H6m-1.5-4L6 17.5V12M4 17h-.5c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1H4m0-4h7.5c.552 0 1 .448 1 1v3c0 .552-.448 1-1 1H4" />
                    </svg>
                  }
                  color="success"
                />
                <MetricCard
                  title="Platform Commission"
                  value={`$${transactionSummary.platformCommission.toLocaleString()}`}
                  subtitle="Total earned"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                  color="warning"
                />
                <MetricCard
                  title="Pending Amount"
                  value={`$${transactionSummary.pendingAmount.toLocaleString()}`}
                  subtitle="Awaiting completion"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  color="info"
                />
                <MetricCard
                  title="Avg Transaction"
                  value={`$${transactionSummary.averageTransactionValue.toFixed(2)}`}
                  subtitle="Per transaction"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  color="primary"
                />
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  <DateRangePicker
                    value={transactionFilters.dateRange}
                    onChange={(range) => setTransactionFilters(prev => ({ ...prev, dateRange: range }))}
                  />
                  <select
                    value={transactionFilters.status || ''}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select
                    value={transactionFilters.paymentMethod || ''}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, paymentMethod: e.target.value as any || undefined }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                  >
                    <option value="">All Payment Methods</option>
                    <option value="card">Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  <ExportButton onExport={handleExportTransactions} />
                </div>

                {/* Transactions Table */}
                <DataTable
                  data={filteredTransactions}
                  columns={transactionColumns}
                  pagination={{
                    page: transactionPage,
                    pageSize: transactionPageSize,
                    total: filteredTransactions.length,
                    onPageChange: setTransactionPage,
                    onPageSizeChange: setTransactionPageSize
                  }}
                />
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Add Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <div key={category} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{category}</h3>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Disable</button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        0 active sellers • 0 requests
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-6">Platform Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Platform Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.platformCommission}
                      onChange={(e) => setSettings(prev => ({ ...prev, platformCommission: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Service Price ($)
                    </label>
                    <input
                      type="number"
                      value={settings.minServicePrice}
                      onChange={(e) => setSettings(prev => ({ ...prev, minServicePrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Service Price ($)
                    </label>
                    <input
                      type="number"
                      value={settings.maxServicePrice}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxServicePrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instant Request Expiry (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.instantRequestExpiry}
                      onChange={(e) => setSettings(prev => ({ ...prev, instantRequestExpiry: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable the platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Seller Verification</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sellers must be verified before accepting requests</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireSellerVerification}
                        onChange={(e) => setSettings(prev => ({ ...prev, requireSellerVerification: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <DateRangePicker
                    value={auditFilters.dateRange}
                    onChange={(range) => setAuditFilters(prev => ({ ...prev, dateRange: range }))}
                  />
                  <select
                    value={auditFilters.action || ''}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                  >
                    <option value="">All Actions</option>
                    <option value="user_blocked">User Blocked</option>
                    <option value="role_changed">Role Changed</option>
                    <option value="request_cancelled">Request Cancelled</option>
                    <option value="refund_processed">Refund Processed</option>
                    <option value="seller_verified">Seller Verified</option>
                  </select>
                  <select
                    value={auditFilters.targetType || ''}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, targetType: e.target.value as any || undefined }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700"
                  >
                    <option value="">All Targets</option>
                    <option value="user">User</option>
                    <option value="request">Request</option>
                    <option value="transaction">Transaction</option>
                    <option value="category">Category</option>
                    <option value="setting">Setting</option>
                  </select>
                  <ExportButton onExport={handleExportAuditLogs} />
                </div>

                <DataTable
                  data={filteredAuditLogs}
                  columns={auditLogColumns}
                />
        </div>
      </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};