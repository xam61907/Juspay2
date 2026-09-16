export type UserRole = 'admin' | 'user';
export type UserStatus = 'Active' | 'Banned';

export interface User {
  id: string;
  username: string;
  email: string;
  available_balance: number;
  deposit_balance: number;
  withdrawal_balance: number;
  commission_balance: number;
  sell_balance: number;
  referral_code: string;
  referred_by?: string; // referrer referral_code
  security_pin: string; // 6-digit PIN
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  points: number;
  created_at: string;
}

export type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Reward'
  | 'Claim'
  | 'Sell'
  | 'Referral Commission'
  | 'Binding Bonus';

export type CurrencyType = 'INR' | 'USDT';
export type TransactionStatus = 'Pending' | 'Completed' | 'Closed' | 'Rejected';

export interface Transaction {
  id: string;
  user_id: string;
  user_email: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  status: TransactionStatus;
  timestamp: string;
  tx_hash?: string;
  proof_screenshot?: string;
  network?: 'TRC20' | 'BSC';
  notes?: string;
  tier_info?: 'Level A (5%)' | 'Level B (2.5%)';
  from_user_id?: string;
  wallet_provider?: string;
}

export type TaskCategory = 'Newbie' | 'Team Growth' | 'Daily';
export type TaskActionType = 'bind' | 'deposit' | 'invite' | 'trade' | 'claim';

export interface Task {
  id: string;
  category: TaskCategory;
  title: string;
  description: string;
  reward_points: number;
  target_amount: number;
  current_progress: number;
  action_type: TaskActionType;
  completed: boolean;
  claimed: boolean;
}

export interface ClaimableOrder {
  id: string;
  code: string;
  amount_inr: number;
  income_inr: number;
  category_range: 'Top Picks' | '100-300' | '301-500' | '501-2000';
  is_claimed: boolean;
  created_at?: string;
}

export type WalletType = 'Personal' | 'Business';

export interface UserWallet {
  id: string;
  user_id: string;
  type: WalletType;
  provider_name: string;
  account_number: string;
  holder_name: string;
  has_binding_bonus: boolean;
  bound_status: 'Active' | 'Pending';
  created_at: string;
}

export interface StatisticsOperations {
  realtime_exchange_rate: number; // e.g. 111 INR per 1 USDT
  in_process_amount: number;
  in_process_orders: number;
  commission_rate: number; // default 4.00%
  selling_state: 'Open' | 'Closed';
  direct_referral_rate: number; // 5.0%
  indirect_referral_rate: number; // 2.5%
  binding_bonus_amount: number; // 50 INR
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'Deposit' | 'Withdrawal' | 'System' | 'Commission';
  is_read: boolean;
  created_at: string;
}

export interface SupportChannel {
  id: string;
  title: string;
  subtitle: string;
  handle: string;
  contact_link: string;
  avatar: string;
}

export interface AutomatedEmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  sent_at: string;
  type: 'Deposit Approval' | 'Withdrawal Receipt' | 'OTP' | 'Binding Alert';
}
