export type Transaction = {
  id: string;
  requestId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  categoryName: string;
  serviceAmount: number;
  platformCommission: number;
  sellerPayout: number;
  paymentMethod: 'card' | 'paypal' | 'bank_transfer';
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  notes?: string;
};

export type TransactionFilters = {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: Transaction['status'];
  paymentMethod?: Transaction['paymentMethod'];
  categoryName?: string;
  amountRange?: {
    min: number;
    max: number;
  };
};

export type TransactionSummary = {
  totalRevenue: number;
  platformCommission: number;
  sellerPayouts: number;
  pendingAmount: number;
  refundedAmount: number;
  transactionCount: number;
  averageTransactionValue: number;
};
