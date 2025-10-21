import type { Transaction, TransactionSummary } from '../types/transaction';
import type { AuditLogEntry } from '../types/auditLog';

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    requestId: 'req-001',
    buyerId: 'user-001',
    buyerName: 'Alice Johnson',
    sellerId: 'seller-001',
    sellerName: 'Mike Smith',
    categoryName: 'Plumber',
    serviceAmount: 150.00,
    platformCommission: 15.00,
    sellerPayout: 135.00,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T14:30:00Z',
    notes: 'Emergency pipe repair'
  },
  {
    id: 'txn-002',
    requestId: 'req-002',
    buyerId: 'user-002',
    buyerName: 'Bob Wilson',
    sellerId: 'seller-002',
    sellerName: 'Sarah Chen',
    categoryName: 'Electrician',
    serviceAmount: 200.00,
    platformCommission: 20.00,
    sellerPayout: 180.00,
    paymentMethod: 'paypal',
    status: 'completed',
    createdAt: '2024-01-15T11:15:00Z',
    completedAt: '2024-01-15T16:45:00Z'
  },
  {
    id: 'txn-003',
    requestId: 'req-003',
    buyerId: 'user-003',
    buyerName: 'Carol Davis',
    sellerId: 'seller-003',
    sellerName: 'David Rodriguez',
    categoryName: 'Cleaning',
    serviceAmount: 80.00,
    platformCommission: 8.00,
    sellerPayout: 72.00,
    paymentMethod: 'card',
    status: 'pending',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'txn-004',
    requestId: 'req-004',
    buyerId: 'user-004',
    buyerName: 'Eve Brown',
    sellerId: 'seller-001',
    sellerName: 'Mike Smith',
    categoryName: 'HVAC',
    serviceAmount: 300.00,
    platformCommission: 30.00,
    sellerPayout: 270.00,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: '2024-01-14T09:20:00Z',
    completedAt: '2024-01-14T13:20:00Z'
  },
  {
    id: 'txn-005',
    requestId: 'req-005',
    buyerId: 'user-005',
    buyerName: 'Frank Miller',
    sellerId: 'seller-004',
    sellerName: 'Lisa Anderson',
    categoryName: 'Painter',
    serviceAmount: 250.00,
    platformCommission: 25.00,
    sellerPayout: 225.00,
    paymentMethod: 'card',
    status: 'refunded',
    createdAt: '2024-01-13T14:30:00Z',
    completedAt: '2024-01-13T18:30:00Z',
    refundedAt: '2024-01-14T10:00:00Z',
    notes: 'Customer not satisfied with quality'
  },
  {
    id: 'txn-006',
    requestId: 'req-006',
    buyerId: 'user-006',
    buyerName: 'Grace Lee',
    sellerId: 'seller-005',
    sellerName: 'Tom Wilson',
    categoryName: 'Welder',
    serviceAmount: 400.00,
    platformCommission: 40.00,
    sellerPayout: 360.00,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2024-01-12T08:45:00Z',
    completedAt: '2024-01-12T12:45:00Z'
  },
  {
    id: 'txn-007',
    requestId: 'req-007',
    buyerId: 'user-007',
    buyerName: 'Henry Taylor',
    sellerId: 'seller-006',
    sellerName: 'Maria Garcia',
    categoryName: 'Carpenter',
    serviceAmount: 180.00,
    platformCommission: 18.00,
    sellerPayout: 162.00,
    paymentMethod: 'paypal',
    status: 'failed',
    createdAt: '2024-01-11T16:20:00Z',
    notes: 'Payment declined'
  },
  {
    id: 'txn-008',
    requestId: 'req-008',
    buyerId: 'user-008',
    buyerName: 'Ivy Chen',
    sellerId: 'seller-007',
    sellerName: 'Alex Kim',
    categoryName: 'Technician',
    serviceAmount: 120.00,
    platformCommission: 12.00,
    sellerPayout: 108.00,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2024-01-10T13:10:00Z',
    completedAt: '2024-01-10T17:10:00Z'
  }
];

// Mock audit log entries
export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'user_blocked',
    targetType: 'user',
    targetId: 'user-009',
    details: 'Blocked user for suspicious activity',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T15:30:00Z'
  },
  {
    id: 'audit-002',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'role_changed',
    targetType: 'user',
    targetId: 'user-010',
    details: 'Changed role from buyer to seller',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T14:20:00Z'
  },
  {
    id: 'audit-003',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'request_cancelled',
    targetType: 'request',
    targetId: 'req-009',
    details: 'Cancelled request due to seller unavailability',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T13:15:00Z'
  },
  {
    id: 'audit-004',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'refund_processed',
    targetType: 'transaction',
    targetId: 'txn-005',
    details: 'Processed refund for unsatisfied customer',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-14T10:00:00Z'
  },
  {
    id: 'audit-005',
    adminId: 'admin-001',
    adminName: 'Admin User',
    action: 'seller_verified',
    targetType: 'user',
    targetId: 'seller-008',
    details: 'Verified seller credentials and documents',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-14T09:45:00Z'
  }
];

// Helper functions
export const getTransactionSummary = (transactions: Transaction[]): TransactionSummary => {
  const completed = transactions.filter(t => t.status === 'completed');
  const pending = transactions.filter(t => t.status === 'pending');
  const refunded = transactions.filter(t => t.status === 'refunded');

  const totalRevenue = completed.reduce((sum, t) => sum + t.serviceAmount, 0);
  const platformCommission = completed.reduce((sum, t) => sum + t.platformCommission, 0);
  const sellerPayouts = completed.reduce((sum, t) => sum + t.sellerPayout, 0);
  const pendingAmount = pending.reduce((sum, t) => sum + t.serviceAmount, 0);
  const refundedAmount = refunded.reduce((sum, t) => sum + t.serviceAmount, 0);

  return {
    totalRevenue,
    platformCommission,
    sellerPayouts,
    pendingAmount,
    refundedAmount,
    transactionCount: transactions.length,
    averageTransactionValue: transactions.length > 0 ? totalRevenue / transactions.length : 0
  };
};

export const filterTransactions = (transactions: Transaction[], filters: any) => {
  return transactions.filter(transaction => {
    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) return false;
    if (filters.categoryName && transaction.categoryName !== filters.categoryName) return false;
    if (filters.dateRange) {
      const transactionDate = new Date(transaction.createdAt);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (transactionDate < startDate || transactionDate > endDate) return false;
    }
    if (filters.amountRange) {
      if (transaction.serviceAmount < filters.amountRange.min || transaction.serviceAmount > filters.amountRange.max) return false;
    }
    return true;
  });
};

export const filterAuditLogs = (logs: AuditLogEntry[], filters: any) => {
  return logs.filter(log => {
    if (filters.adminId && log.adminId !== filters.adminId) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.targetType && log.targetType !== filters.targetType) return false;
    if (filters.dateRange) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (logDate < startDate || logDate > endDate) return false;
    }
    return true;
  });
};
