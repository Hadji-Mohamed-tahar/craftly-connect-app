// ========== User Types ==========
export type UserRole = 'artisan' | 'customer' | 'admin';

export interface User {
  id?: string;
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

// ========== Membership Plans ==========
export interface MembershipPlan {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  createdAt: string;
  isActive?: boolean;
}

// ========== Subscriptions ==========
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id?: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  lastPaymentRef?: string;
  paymentCount: number;
  createdAt: string;
  updatedAt: string;
}

// ========== Transactions ==========
export type TransactionType = 
  | 'membership_payment' 
  | 'commission_payment'
  | 'advertising_payment'
  | 'featured_payment'
  | 'other_payment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Transaction {
  id?: string;
  type: TransactionType;
  userId: string;
  userName?: string;
  planId?: string;
  subscriptionRef?: string;
  amount: number;
  currency: string;
  platformShare: number;
  status: TransactionStatus;
  paymentProvider?: string;
  meta?: {
    invoiceId?: string;
    details?: Record<string, any>;
    notes?: string;
  };
  createdAt: string;
  completedAt?: string;
}

// ========== Company Finances ==========
export interface CompanyFinances {
  id?: string;
  period: string; // e.g., "2025-10" or "2025-Q1"
  membershipRevenueTotal: number;
  commissionRevenueTotal: number;
  advertisingRevenueTotal: number;
  featuredRevenueTotal: number;
  otherRevenueTotal: number;
  totalRevenue: number;
  totalTransactions: number;
  currency: string;
  lastUpdated: string;
  createdAt?: string;
}

// ========== Settings ==========
export interface RevenueRules {
  defaultCurrency: string;
  taxPercent: number;
  platformCommissionPercent: number;
  lastUpdated: string;
}

export interface FinancialSettings {
  revenueRules: RevenueRules;
}
