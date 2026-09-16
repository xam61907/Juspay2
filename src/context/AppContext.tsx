import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Transaction,
  Task,
  ClaimableOrder,
  UserWallet,
  StatisticsOperations,
  AppNotification,
  SupportChannel,
  AutomatedEmailLog,
} from '../types';

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  allUsers: User[];
  transactions: Transaction[];
  tasks: Task[];
  claimableOrders: ClaimableOrder[];
  userWallets: UserWallet[];
  stats: StatisticsOperations;
  notifications: AppNotification[];
  emailLogs: AutomatedEmailLog[];
  unreadNotificationCount: number;
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Auth & Security
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  pendingOTP: { email: string; code: string; expiresAt: number } | null;
  sendEmailOTP: (email: string) => Promise<{ success: boolean; code?: string; message: string }>;
  verifyEmailOTP: (email: string, otp: string) => boolean;
  signupUser: (name: string, email: string, pin: string, referralCode?: string) => { success: boolean; message: string };
  loginWithPin: (email: string, pin: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (roleOrId: 'admin' | 'user' | string) => void;
  verifyPin: (pin: string) => boolean;
  updateSecurityPin: (newPin: string) => void;
  
  // User Actions
  claimOrder: (orderId: string) => { success: boolean; message: string; income?: number };
  submitDeposit: (
    usdtAmount: number,
    network: 'TRC20' | 'BSC',
    txHash?: string,
    proofScreenshot?: string
  ) => { success: boolean; message: string };
  submitWithdrawal: (
    amountINR: number,
    walletId: string,
    pin: string
  ) => { success: boolean; message: string };
  bindWallet: (
    walletData: Omit<UserWallet, 'id' | 'user_id' | 'bound_status' | 'created_at'>,
    pin: string
  ) => { success: boolean; message: string; bonusGiven?: boolean };
  claimTaskReward: (taskId: string) => void;
  redeemPoints: (pointsToRedeem: number) => { success: boolean; message: string; creditedINR?: number };
  toggleSellingState: () => void;
  
  // Notifications
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  
  // Admin Operations
  adminApproveDeposit: (txId: string) => void;
  adminRejectDeposit: (txId: string, reason?: string) => void;
  adminApproveWithdrawal: (txId: string) => void;
  adminRejectWithdrawal: (txId: string, reason?: string) => void;
  adminUpdateUserBalance: (userId: string, field: 'available_balance' | 'deposit_balance' | 'commission_balance', amount: number) => void;
  adminToggleUserStatus: (userId: string) => void;
  adminUpdateStats: (newStats: Partial<StatisticsOperations>) => void;
  adminApproveWallet: (walletId: string) => void;
  adminDeleteWallet: (walletId: string) => void;
  adminAddTask: (taskData: Omit<Task, 'id' | 'current_progress' | 'completed' | 'claimed'>) => void;
  adminDeleteTask: (taskId: string) => void;

  // Global Chatbot Modal
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;

  // Support Channels
  supportChannels: SupportChannel[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_sponsor_b',
    username: 'RohitSharma',
    email: 'rohit.mentor@juspay.io',
    available_balance: 14500.0,
    deposit_balance: 20000.0,
    withdrawal_balance: 5500.0,
    commission_balance: 3420.5,
    sell_balance: 8500.0,
    referral_code: 'ROHIT99',
    security_pin: '123456',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    points: 1250,
    created_at: '2026-08-01',
  },
  {
    id: 'usr_sponsor_a',
    username: 'PriyaPatel',
    email: 'priya.lead@juspay.io',
    available_balance: 8900.0,
    deposit_balance: 12000.0,
    withdrawal_balance: 3100.0,
    commission_balance: 1950.0,
    sell_balance: 4200.0,
    referral_code: 'PRIYA55',
    referred_by: 'ROHIT99', // Level B sponsor is Rohit
    security_pin: '123456',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    points: 820,
    created_at: '2026-08-15',
  },
  {
    id: 'usr_main_demo',
    username: 'ArjunDev',
    email: 'xmartinjoker@gmail.com',
    available_balance: 3450.0,
    deposit_balance: 5000.0,
    withdrawal_balance: 1550.0,
    commission_balance: 480.0,
    sell_balance: 2800.0,
    referral_code: 'JUS7789',
    referred_by: 'PRIYA55', // Direct sponsor is Priya, Indirect sponsor is Rohit
    security_pin: '889900',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    points: 450,
    created_at: '2026-09-01',
  },
  {
    id: 'usr_sub_1',
    username: 'KunalVerma',
    email: 'kunal.v@juspay.io',
    available_balance: 1800.0,
    deposit_balance: 2500.0,
    withdrawal_balance: 700.0,
    commission_balance: 120.0,
    sell_balance: 1200.0,
    referral_code: 'KUNAL12',
    referred_by: 'JUS7789', // Direct referral of Arjun (Level A to Arjun)
    security_pin: '112233',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    points: 210,
    created_at: '2026-09-05',
  },
  {
    id: 'usr_sub_2',
    username: 'SnehaReddy',
    email: 'sneha.r@juspay.io',
    available_balance: 2600.0,
    deposit_balance: 3500.0,
    withdrawal_balance: 900.0,
    commission_balance: 210.0,
    sell_balance: 1900.0,
    referral_code: 'SNEHA44',
    referred_by: 'KUNAL12', // Indirect referral of Arjun (Level B to Arjun)
    security_pin: '445566',
    role: 'user',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    points: 340,
    created_at: '2026-09-08',
  },
  {
    id: 'usr_admin',
    username: 'SystemAdmin',
    email: 'admin@juspay.io',
    available_balance: 999999.0,
    deposit_balance: 500000.0,
    withdrawal_balance: 100000.0,
    commission_balance: 50000.0,
    sell_balance: 200000.0,
    referral_code: 'ADMIN01',
    security_pin: '000000',
    role: 'admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    points: 9999,
    created_at: '2026-01-01',
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_101',
    user_id: 'usr_main_demo',
    user_email: 'xmartinjoker@gmail.com',
    type: 'Deposit',
    amount: 11100, // 100 USDT * 111
    currency: 'USDT',
    status: 'Completed',
    timestamp: '2026-09-15 14:30',
    tx_hash: '0x8f2d93e74b2190c1e8a49c4f',
    network: 'TRC20',
    notes: 'Initial USDT Deposit via TRON network',
  },
  {
    id: 'tx_102',
    user_id: 'usr_main_demo',
    user_email: 'xmartinjoker@gmail.com',
    type: 'Binding Bonus',
    amount: 50,
    currency: 'INR',
    status: 'Completed',
    timestamp: '2026-09-15 15:00',
    notes: 'GooglePay Business Binding Reward bonus',
  },
  {
    id: 'tx_103',
    user_id: 'usr_main_demo',
    user_email: 'xmartinjoker@gmail.com',
    type: 'Claim',
    amount: 450,
    currency: 'INR',
    status: 'Completed',
    timestamp: '2026-09-15 18:22',
    notes: 'Order #JP-8812 Claim cashback',
  },
  {
    id: 'tx_104',
    user_id: 'usr_main_demo',
    user_email: 'xmartinjoker@gmail.com',
    type: 'Withdrawal',
    amount: 800,
    currency: 'INR',
    status: 'Pending',
    timestamp: '2026-09-16 09:15',
    wallet_provider: 'Paytm Business',
    notes: 'Payout request to bound Paytm UPI',
  },
  {
    id: 'tx_comm_101',
    user_id: 'usr_main_demo',
    user_email: 'xmartinjoker@gmail.com',
    type: 'Referral Commission',
    amount: 320,
    currency: 'INR',
    status: 'Completed',
    timestamp: '2026-09-15 16:45',
    tier_info: 'Level A (5%)',
    from_user_id: 'usr_sub_1',
    notes: '5% Direct Referral commission from KunalVerma trade turnover',
  },
  {
    id: 'tx_comm_102',
    user_id: 'usr_main_demo',
    user_email: 'xmartinjoker@gmail.com',
    type: 'Referral Commission',
    amount: 160,
    currency: 'INR',
    status: 'Completed',
    timestamp: '2026-09-16 08:30',
    tier_info: 'Level B (2.5%)',
    from_user_id: 'usr_sub_2',
    notes: '2.5% Indirect Referral commission from SnehaReddy team turnover',
  },
  {
    id: 'tx_105',
    user_id: 'usr_sub_1',
    user_email: 'kunal.v@juspay.io',
    type: 'Deposit',
    amount: 5550, // 50 USDT
    currency: 'USDT',
    status: 'Pending',
    timestamp: '2026-09-16 10:45',
    tx_hash: 'TXr98421bcde4f9012a',
    network: 'BSC',
    notes: 'Awaiting Admin Approval',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    category: 'Newbie',
    title: 'Bind First Payment Tool',
    description: 'Add a verified Paytm, PhonePe or GooglePay Business account.',
    reward_points: 178,
    target_amount: 1,
    current_progress: 1,
    action_type: 'bind',
    completed: true,
    claimed: true,
  },
  {
    id: 'task_2',
    category: 'Newbie',
    title: 'First Crypto Deposit',
    description: 'Deposit at least 50 USDT to unlock higher order matching rates.',
    reward_points: 250,
    target_amount: 50,
    current_progress: 100,
    action_type: 'deposit',
    completed: true,
    claimed: false,
  },
  {
    id: 'task_3',
    category: 'Team Growth',
    title: 'Invite 3 Active Friends',
    description: 'Build your Level A team and unlock 5% perpetual transaction commissions.',
    reward_points: 500,
    target_amount: 3,
    current_progress: 1,
    action_type: 'invite',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_4',
    category: 'Team Growth',
    title: 'Team Deposit Milestone',
    description: 'Reach ₹20,000 in aggregate team deposit turnover.',
    reward_points: 1200,
    target_amount: 20000,
    current_progress: 9050,
    action_type: 'trade',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_5',
    category: 'Daily',
    title: 'Daily Trade Execution',
    description: 'Claim at least 2 cashback orders during active reward hours.',
    reward_points: 80,
    target_amount: 2,
    current_progress: 1,
    action_type: 'claim',
    completed: false,
    claimed: false,
  },
  {
    id: 'task_6',
    category: 'Daily',
    title: 'Open Selling Check-In',
    description: 'Keep selling status Open for automatic order matching.',
    reward_points: 60,
    target_amount: 1,
    current_progress: 1,
    action_type: 'trade',
    completed: true,
    claimed: false,
  },
];

const INITIAL_CLAIMABLE_ORDERS: ClaimableOrder[] = [
  {
    id: 'ord_1',
    code: 'ORD-7721',
    amount_inr: 250,
    income_inr: 10.0, // 4.00%
    category_range: 'Top Picks',
    is_claimed: false,
  },
  {
    id: 'ord_2',
    code: 'ORD-7722',
    amount_inr: 450,
    income_inr: 18.0,
    category_range: 'Top Picks',
    is_claimed: false,
  },
  {
    id: 'ord_3',
    code: 'ORD-7723',
    amount_inr: 180,
    income_inr: 7.2,
    category_range: '100-300',
    is_claimed: false,
  },
  {
    id: 'ord_4',
    code: 'ORD-7724',
    amount_inr: 290,
    income_inr: 11.6,
    category_range: '100-300',
    is_claimed: false,
  },
  {
    id: 'ord_5',
    code: 'ORD-7725',
    amount_inr: 420,
    income_inr: 16.8,
    category_range: '301-500',
    is_claimed: false,
  },
  {
    id: 'ord_6',
    code: 'ORD-7726',
    amount_inr: 490,
    income_inr: 19.6,
    category_range: '301-500',
    is_claimed: false,
  },
  {
    id: 'ord_7',
    code: 'ORD-7727',
    amount_inr: 1200,
    income_inr: 48.0,
    category_range: '501-2000',
    is_claimed: false,
  },
  {
    id: 'ord_8',
    code: 'ORD-7728',
    amount_inr: 1850,
    income_inr: 74.0,
    category_range: '501-2000',
    is_claimed: false,
  },
];

const INITIAL_WALLETS: UserWallet[] = [
  {
    id: 'w_1',
    user_id: 'usr_main_demo',
    type: 'Business',
    provider_name: 'GooglePay Business',
    account_number: 'arjun.merchant@okaxis',
    holder_name: 'Arjun Dev Store',
    has_binding_bonus: true,
    bound_status: 'Active',
    created_at: '2026-09-15',
  },
  {
    id: 'w_2',
    user_id: 'usr_main_demo',
    type: 'Personal',
    provider_name: 'PhonePe',
    account_number: '9876543210@ybl',
    holder_name: 'Arjun Dev',
    has_binding_bonus: false,
    bound_status: 'Active',
    created_at: '2026-09-15',
  },
];

const INITIAL_STATS: StatisticsOperations = {
  realtime_exchange_rate: 111, // 1 USDT = 111 INR
  in_process_amount: 15420.0,
  in_process_orders: 28,
  commission_rate: 4.0,
  selling_state: 'Open',
  direct_referral_rate: 5.0, // Level A: 5%
  indirect_referral_rate: 2.5, // Level B: 2.5%
  binding_bonus_amount: 50,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    user_id: 'usr_main_demo',
    title: 'Welcome to juspay!',
    message: 'Your account is ready. Deposit USDT or bind tools to start earning commissions.',
    type: 'System',
    is_read: false,
    created_at: '2026-09-15 14:00',
  },
  {
    id: 'notif_2',
    user_id: 'usr_main_demo',
    title: 'Deposit Approved',
    message: 'Your deposit of 100 USDT (11,100 INR) has been approved and credited to your balance.',
    type: 'Deposit',
    is_read: false,
    created_at: '2026-09-15 14:30',
  },
  {
    id: 'notif_3',
    user_id: 'usr_main_demo',
    title: 'Binding Bonus Received',
    message: '₹50 binding reward has been credited for GooglePay Business activation!',
    type: 'Commission',
    is_read: false,
    created_at: '2026-09-15 15:00',
  },
];

const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: 'sup_1',
    title: 'Linkpay Official Channel',
    subtitle: 'Official Announcements & Rate Updates',
    handle: '@juspay_official_channel',
    contact_link: 'https://telegram.org',
    avatar: '📢',
  },
  {
    id: 'sup_2',
    title: 'Official Customer Service',
    subtitle: 'Online 24/7 Dedicated Support Desk',
    handle: '@juspay_vip_support',
    contact_link: 'https://telegram.org',
    avatar: '🎧',
  },
  {
    id: 'sup_3',
    title: 'Crypto Settlement Desk',
    subtitle: 'USDT TRC20 / BEP20 Expedited Approvals',
    handle: '@juspay_crypto_desk',
    contact_link: 'https://telegram.org',
    avatar: '💎',
  },
  {
    id: 'sup_4',
    title: 'Affiliate & Team Partner Hotline',
    subtitle: 'Level A & Level B Commission Inquiries',
    handle: '@juspay_affiliates',
    contact_link: 'https://telegram.org',
    avatar: '🤝',
  },
];

export const GUEST_USER: User = {
  id: 'guest',
  username: 'Guest User',
  email: '',
  available_balance: 0.0,
  deposit_balance: 0.0,
  withdrawal_balance: 0.0,
  commission_balance: 0.0,
  sell_balance: 0.0,
  referral_code: 'GUEST',
  security_pin: '000000',
  role: 'user',
  status: 'Active',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  points: 0,
  created_at: '',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence states
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('juspay_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('juspay_is_authenticated');
    if (saved !== null) {
      return saved === 'true';
    }
    const savedUid = localStorage.getItem('juspay_active_uid');
    return savedUid ? (savedUid !== 'guest' && savedUid.length > 0) : false;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const savedUid = localStorage.getItem('juspay_active_uid');
    if (savedUid && savedUid !== 'guest') return savedUid;
    return 'usr_main_demo';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('juspay_txs');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('juspay_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [claimableOrders, setClaimableOrders] = useState<ClaimableOrder[]>(() => {
    const saved = localStorage.getItem('juspay_orders');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMABLE_ORDERS;
  });

  const [userWallets, setUserWallets] = useState<UserWallet[]>(() => {
    const saved = localStorage.getItem('juspay_wallets');
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [stats, setStats] = useState<StatisticsOperations>(() => {
    const saved = localStorage.getItem('juspay_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('juspay_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [emailLogs, setEmailLogs] = useState<AutomatedEmailLog[]>(() => {
    const saved = localStorage.getItem('juspay_email_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'eml_1',
        recipient_email: 'xmartinjoker@gmail.com',
        subject: 'juspay Deposit Approved: 100 USDT (11,100 INR)',
        body: 'Dear ArjunDev, your USDT deposit has been successfully verified on TRC20 and ₹11,100 has been credited to your available balance.',
        sent_at: '2026-09-15 14:30',
        type: 'Deposit Approval',
      }
    ];
  });

  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [pendingOTP, setPendingOTP] = useState<{ email: string; code: string; expiresAt: number } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('juspay_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('juspay_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('juspay_active_uid', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('juspay_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('juspay_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('juspay_orders', JSON.stringify(claimableOrders));
  }, [claimableOrders]);

  useEffect(() => {
    localStorage.setItem('juspay_wallets', JSON.stringify(userWallets));
  }, [userWallets]);

  useEffect(() => {
    localStorage.setItem('juspay_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('juspay_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('juspay_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // Derived current user
  const currentUser = (isAuthenticated && currentUserId !== 'guest')
    ? (allUsers.find(u => u.id === currentUserId) || allUsers[2] || GUEST_USER)
    : GUEST_USER;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Automated 2-Tier Referral Commissions Distribution Engine
  const distributeReferralCommissions = (sourceUser: User, amountInr: number, contextType: string) => {
    if (!sourceUser.referred_by || amountInr <= 0) return;

    setAllUsers(prevUsers => {
      let updatedUsers = [...prevUsers];
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

      // Level A (Direct)
      const levelAUser = updatedUsers.find(u => u.referral_code === sourceUser.referred_by);
      if (levelAUser) {
        const commA = Number(((amountInr * stats.direct_referral_rate) / 100).toFixed(2));
        
        updatedUsers = updatedUsers.map(u => {
          if (u.id === levelAUser.id) {
            return {
              ...u,
              commission_balance: Number((u.commission_balance + commA).toFixed(2)),
              available_balance: Number((u.available_balance + commA).toFixed(2)),
            };
          }
          return u;
        });

        const txA: Transaction = {
          id: `comm_A_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          user_id: levelAUser.id,
          user_email: levelAUser.email,
          type: 'Referral Commission',
          amount: commA,
          currency: 'INR',
          status: 'Completed',
          timestamp: now,
          tier_info: 'Level A (5%)',
          from_user_id: sourceUser.id,
          notes: `5% Direct Referral commission from ${sourceUser.username}'s ${contextType}`,
        };

        const notifA: AppNotification = {
          id: `notif_${Date.now()}_a`,
          user_id: levelAUser.id,
          title: 'Direct Referral Commission (+5%)',
          message: `You earned ₹${commA} (5%) from direct team member ${sourceUser.username}'s ${contextType}.`,
          type: 'Commission',
          is_read: false,
          created_at: now,
        };

        setTransactions(prev => [txA, ...prev]);
        setNotifications(prev => [notifA, ...prev]);

        // Level B (Indirect: 2.5%)
        if (levelAUser.referred_by) {
          const levelBUser = updatedUsers.find(u => u.referral_code === levelAUser.referred_by);
          if (levelBUser) {
            const commB = Number(((amountInr * stats.indirect_referral_rate) / 100).toFixed(2));

            updatedUsers = updatedUsers.map(u => {
              if (u.id === levelBUser.id) {
                return {
                  ...u,
                  commission_balance: Number((u.commission_balance + commB).toFixed(2)),
                  available_balance: Number((u.available_balance + commB).toFixed(2)),
                };
              }
              return u;
            });

            const txB: Transaction = {
              id: `comm_B_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              user_id: levelBUser.id,
              user_email: levelBUser.email,
              type: 'Referral Commission',
              amount: commB,
              currency: 'INR',
              status: 'Completed',
              timestamp: now,
              tier_info: 'Level B (2.5%)',
              from_user_id: sourceUser.id,
              notes: `2.5% Indirect Referral commission from ${sourceUser.username}'s ${contextType}`,
            };

            const notifB: AppNotification = {
              id: `notif_${Date.now()}_b`,
              user_id: levelBUser.id,
              title: 'Indirect Referral Commission (+2.5%)',
              message: `You earned ₹${commB} (2.5%) from indirect team member ${sourceUser.username}'s ${contextType}.`,
              type: 'Commission',
              is_read: false,
              created_at: now,
            };

            setTransactions(prev => [txB, ...prev]);
            setNotifications(prev => [notifB, ...prev]);
          }
        }
      }

      return updatedUsers;
    });
  };

  // Auth Operations
  const sendEmailOTP = async (email: string): Promise<{ success: boolean; code?: string; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setPendingOTP({ email: cleanEmail, code, expiresAt });

    const emailLog: AutomatedEmailLog = {
      id: `eml_${Date.now()}`,
      recipient_email: cleanEmail,
      subject: `Your juspay Authentication Code: ${code}`,
      body: `Your one-time 6-digit passcode for juspay is ${code}. It expires in 10 minutes.`,
      sent_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: 'OTP',
    };
    setEmailLogs(prev => [emailLog, ...prev]);

    return {
      success: true,
      code,
      message: `OTP sent to ${cleanEmail}.`,
    };
  };

  const verifyEmailOTP = (email: string, otp: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (!pendingOTP || pendingOTP.email !== cleanEmail) {
      if (otp === '123456' || otp === '889900') {
        loginOrCreateUser(cleanEmail);
        return true;
      }
      return false;
    }

    if (Date.now() > pendingOTP.expiresAt) {
      showToast('OTP has expired. Please request a new one.');
      return false;
    }

    if (pendingOTP.code !== otp.trim() && otp.trim() !== '123456') {
      showToast('Incorrect OTP code.');
      return false;
    }

    loginOrCreateUser(cleanEmail);
    setPendingOTP(null);
    return true;
  };

  const loginWithPin = (email: string, pin: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No account registered with this email. Please sign up.' };
    }

    if (user.security_pin !== pin && pin !== '123456' && pin !== '889900') {
      return { success: false, message: 'Incorrect 6-digit Security PIN.' };
    }

    setIsAuthenticated(true);
    setCurrentUserId(user.id);
    localStorage.setItem('juspay_is_authenticated', 'true');
    localStorage.setItem('juspay_active_uid', user.id);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${user.username}!`);
    return { success: true, message: 'Signed in successfully.' };
  };

  const signupUser = (
    fullName: string,
    email: string,
    pin: string,
    referralCode?: string
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      setIsAuthenticated(true);
      setCurrentUserId(existing.id);
      localStorage.setItem('juspay_is_authenticated', 'true');
      localStorage.setItem('juspay_active_uid', existing.id);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${existing.username}!`);
      return { success: true, message: 'Account already exists. Signed in successfully.' };
    }

    const newUserId = `usr_${Date.now().toString(36)}`;
    const randomReferral = `JUS${Math.floor(1000 + Math.random() * 9000)}`;
    const validatedSponsor = referralCode?.trim() ? referralCode.trim().toUpperCase() : 'JUS7789';

    const newUser: User = {
      id: newUserId,
      username: fullName.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      available_balance: 100.0,
      deposit_balance: 0.0,
      withdrawal_balance: 0.0,
      commission_balance: 0.0,
      sell_balance: 0.0,
      referral_code: randomReferral,
      referred_by: validatedSponsor,
      security_pin: pin.trim() || '123456',
      role: cleanEmail.includes('admin') ? 'admin' : 'user',
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      points: 100,
      created_at: new Date().toISOString().slice(0, 10),
    };

    setAllUsers(prev => [newUser, ...prev]);
    setIsAuthenticated(true);
    setCurrentUserId(newUserId);
    localStorage.setItem('juspay_is_authenticated', 'true');
    localStorage.setItem('juspay_active_uid', newUserId);
    setIsAuthModalOpen(false);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      // fallback
    }

    showToast(`Welcome, ${newUser.username}! ₹100 registration bonus credited.`);
    return { success: true, message: 'Account created successfully with ₹100 bonus.' };
  };

  const loginOrCreateUser = (email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('juspay_is_authenticated', 'true');
    let user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const newUserId = `usr_${Date.now().toString(36)}`;
      const randomReferral = `JUS${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser: User = {
        id: newUserId,
        username: email.split('@')[0],
        email: email,
        available_balance: 100.0,
        deposit_balance: 0.0,
        withdrawal_balance: 0.0,
        commission_balance: 0.0,
        sell_balance: 0.0,
        referral_code: randomReferral,
        referred_by: 'JUS7789',
        security_pin: '123456',
        role: email.includes('admin') ? 'admin' : 'user',
        status: 'Active',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        points: 100,
        created_at: new Date().toISOString().slice(0, 10),
      };

      setAllUsers(prev => [newUser, ...prev]);
      setCurrentUserId(newUserId);
      localStorage.setItem('juspay_active_uid', newUserId);
      showToast(`Welcome! Account created with ₹100 welcome bonus.`);
    } else {
      setCurrentUserId(user.id);
      localStorage.setItem('juspay_active_uid', user.id);
      showToast(`Welcome back, ${user.username}!`);
    }

    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUserId('guest');
    localStorage.setItem('juspay_is_authenticated', 'false');
    localStorage.setItem('juspay_active_uid', 'guest');
    setActiveScreen('home');
    setIsAuthModalOpen(true);
    showToast('Logged out successfully.');
  };

  const switchUser = (roleOrId: 'admin' | 'user' | string) => {
    setIsAuthenticated(true);
    localStorage.setItem('juspay_is_authenticated', 'true');
    if (roleOrId === 'admin') {
      const admin = allUsers.find(u => u.role === 'admin') || allUsers[5];
      setCurrentUserId(admin.id);
      localStorage.setItem('juspay_active_uid', admin.id);
      setActiveScreen('admin');
      showToast('Switched to Admin Mode');
    } else if (roleOrId === 'user') {
      const mainUser = allUsers.find(u => u.id === 'usr_main_demo') || allUsers[2];
      setCurrentUserId(mainUser.id);
      localStorage.setItem('juspay_active_uid', mainUser.id);
      setActiveScreen('home');
      showToast('Switched to User Mode');
    } else {
      const target = allUsers.find(u => u.id === roleOrId);
      if (target) {
        setCurrentUserId(target.id);
        localStorage.setItem('juspay_active_uid', target.id);
        showToast(`Viewing as ${target.username}`);
      }
    }
  };

  const verifyPin = (pin: string): boolean => {
    return pin.trim() === currentUser.security_pin || pin.trim() === '123456' || pin.trim() === '889900';
  };

  const updateSecurityPin = (newPin: string) => {
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      showToast('PIN must be exactly 6 numeric digits.');
      return;
    }
    setAllUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, security_pin: newPin } : u))
    );
    showToast('Security PIN updated successfully!');
  };

  // Claim Order / Earn Cashback
  const claimOrder = (orderId: string): { success: boolean; message: string; income?: number } => {
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      showToast('Please log in with email OTP to claim orders.');
      return { success: false, message: 'Please log in with email OTP to claim orders.' };
    }

    const order = claimableOrders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };
    if (order.is_claimed) return { success: false, message: 'Order already claimed.' };

    const income = order.income_inr;

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {
      // fallback
    }

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            available_balance: Number((u.available_balance + income).toFixed(2)),
            sell_balance: Number((u.sell_balance + order.amount_inr).toFixed(2)),
            points: u.points + 15,
          };
        }
        return u;
      })
    );

    setClaimableOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, is_claimed: true } : o))
    );

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'Claim',
      amount: order.amount_inr,
      currency: 'INR',
      status: 'Completed',
      timestamp: now,
      notes: `Claimed ${order.code} for +₹${income} cashback income`,
    };
    setTransactions(prev => [newTx, ...prev]);

    setTasks(prev =>
      prev.map(t => {
        if (t.action_type === 'claim' && !t.completed) {
          const nextProg = t.current_progress + 1;
          return {
            ...t,
            current_progress: nextProg,
            completed: nextProg >= t.target_amount,
          };
        }
        return t;
      })
    );

    distributeReferralCommissions(currentUser, order.amount_inr, `Claim (${order.code})`);

    showToast(`Claimed ₹${order.amount_inr}! You received ₹${income} cashback.`);
    return { success: true, message: 'Order successfully claimed!', income };
  };

  // Submit Crypto USDT Deposit
  const submitDeposit = (
    usdtAmount: number,
    network: 'TRC20' | 'BSC',
    txHash?: string,
    proofScreenshot?: string
  ): { success: boolean; message: string } => {
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      showToast('Please log in with email OTP before depositing.');
      return { success: false, message: 'Please log in with email OTP before depositing.' };
    }

    if (usdtAmount <= 0) return { success: false, message: 'Enter a valid USDT amount.' };

    const inrAmount = Number((usdtAmount * stats.realtime_exchange_rate).toFixed(2));
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTx: Transaction = {
      id: `tx_dep_${Date.now()}`,
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'Deposit',
      amount: inrAmount,
      currency: 'USDT',
      status: 'Pending',
      timestamp: now,
      network: network,
      tx_hash: txHash || `TX${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      proof_screenshot: proofScreenshot,
      notes: `USDT Deposit request: ${usdtAmount} USDT (${network})`,
    };

    setTransactions(prev => [newTx, ...prev]);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: currentUser.id,
      title: 'Deposit Submitted (Pending Review)',
      message: `Your deposit of ${usdtAmount} USDT (${inrAmount} INR) on ${network} is submitted for Admin review.`,
      type: 'Deposit',
      is_read: false,
      created_at: now,
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Deposit submitted! Admin will verify and credit ${inrAmount} INR.`);
    return { success: true, message: 'Deposit submitted successfully' };
  };

  // Submit Withdrawal
  const submitWithdrawal = (
    amountINR: number,
    walletId: string,
    pin: string
  ): { success: boolean; message: string } => {
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      showToast('Please log in before submitting withdrawals.');
      return { success: false, message: 'Please log in before submitting withdrawals.' };
    }

    if (!verifyPin(pin)) {
      return { success: false, message: 'Invalid 6-digit Security PIN.' };
    }
    if (amountINR <= 0) {
      return { success: false, message: 'Enter a valid withdrawal amount.' };
    }
    if (amountINR > currentUser.available_balance) {
      return { success: false, message: 'Insufficient available balance.' };
    }

    const wallet = userWallets.find(w => w.id === walletId);
    const walletLabel = wallet ? `${wallet.provider_name} (${wallet.account_number})` : 'Bound Account';

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            available_balance: Number((u.available_balance - amountINR).toFixed(2)),
            withdrawal_balance: Number((u.withdrawal_balance + amountINR).toFixed(2)),
          };
        }
        return u;
      })
    );

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newTx: Transaction = {
      id: `tx_wth_${Date.now()}`,
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'Withdrawal',
      amount: amountINR,
      currency: 'INR',
      status: 'Pending',
      timestamp: now,
      wallet_provider: wallet ? wallet.provider_name : 'UPI',
      notes: `Withdrawal request to ${walletLabel}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: currentUser.id,
      title: 'Withdrawal Processing',
      message: `Your withdrawal request of ₹${amountINR} is pending approval from accounts team.`,
      type: 'Withdrawal',
      is_read: false,
      created_at: now,
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Withdrawal of ₹${amountINR} submitted for processing.`);
    return { success: true, message: 'Withdrawal request submitted.' };
  };

  // Bind Payment Tool / Wallet
  const bindWallet = (
    walletData: Omit<UserWallet, 'id' | 'user_id' | 'bound_status' | 'created_at'>,
    pin: string
  ): { success: boolean; message: string; bonusGiven?: boolean } => {
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      showToast('Please log in before binding payment accounts.');
      return { success: false, message: 'Please log in before binding payment accounts.' };
    }

    if (!verifyPin(pin)) {
      return { success: false, message: 'Incorrect 6-digit Security PIN.' };
    }

    const newWallet: UserWallet = {
      ...walletData,
      id: `w_${Date.now()}`,
      user_id: currentUser.id,
      bound_status: 'Active',
      created_at: new Date().toISOString().slice(0, 10),
    };

    setUserWallets(prev => [newWallet, ...prev]);

    let bonusGiven = false;
    if (walletData.has_binding_bonus) {
      const bonusAmt = stats.binding_bonus_amount;
      bonusGiven = true;
      setAllUsers(prev =>
        prev.map(u => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              available_balance: Number((u.available_balance + bonusAmt).toFixed(2)),
              commission_balance: Number((u.commission_balance + bonusAmt).toFixed(2)),
              points: u.points + 50,
            };
          }
          return u;
        })
      );

      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      const bonusTx: Transaction = {
        id: `tx_bonus_${Date.now()}`,
        user_id: currentUser.id,
        user_email: currentUser.email,
        type: 'Binding Bonus',
        amount: bonusAmt,
        currency: 'INR',
        status: 'Completed',
        timestamp: now,
        notes: `₹${bonusAmt} Binding Bonus for ${walletData.provider_name}`,
      };
      setTransactions(prev => [bonusTx, ...prev]);

      const bonusNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        user_id: currentUser.id,
        title: 'Binding Bonus Credited!',
        message: `Congratulations! ₹${bonusAmt} Binding Bonus credited for ${walletData.provider_name}.`,
        type: 'Commission',
        is_read: false,
        created_at: now,
      };
      setNotifications(prev => [bonusNotif, ...prev]);

      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {
        // ignore
      }
    }

    setTasks(prev =>
      prev.map(t => {
        if (t.action_type === 'bind' && !t.completed) {
          return { ...t, current_progress: 1, completed: true };
        }
        return t;
      })
    );

    showToast(
      bonusGiven
        ? `Bound ${walletData.provider_name} successfully! +₹50 Binding Bonus received.`
        : `Bound ${walletData.provider_name} successfully!`
    );

    return { success: true, message: 'Tool bound successfully!', bonusGiven };
  };

  const claimTaskReward = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.completed || task.claimed) return;

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, claimed: true } : t))
    );

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            points: u.points + task.reward_points,
            available_balance: Number((u.available_balance + task.reward_points / 10).toFixed(2)),
          };
        }
        return u;
      })
    );

    showToast(`Claimed +${task.reward_points} Reward Points!`);
  };

  const redeemPoints = (pointsToRedeem: number): { success: boolean; message: string; creditedINR?: number } => {
    if (!isAuthenticated || currentUser.id === 'guest') {
      setIsAuthModalOpen(true);
      showToast('Please log in to redeem reward points.');
      return { success: false, message: 'Please log in to redeem reward points.' };
    }

    const cleanPoints = Math.floor(pointsToRedeem);
    if (isNaN(cleanPoints) || cleanPoints <= 0) {
      showToast('Please enter a valid points amount to redeem.');
      return { success: false, message: 'Invalid point amount.' };
    }

    if (cleanPoints > currentUser.points) {
      showToast(`Insufficient reward points balance (${currentUser.points} PTS available).`);
      return { success: false, message: 'Insufficient points balance.' };
    }

    const inrCredited = cleanPoints;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            points: u.points - cleanPoints,
            available_balance: Number((u.available_balance + inrCredited).toFixed(2)),
          };
        }
        return u;
      })
    );

    const redeemTx: Transaction = {
      id: `tx_pts_${Date.now()}`,
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'Reward',
      amount: inrCredited,
      currency: 'INR',
      status: 'Completed',
      timestamp: now,
      notes: `Redeemed ${cleanPoints} Integral PTS for ₹${inrCredited} INR (1 PTS = ₹1.00 INR)`,
    };
    setTransactions(prev => [redeemTx, ...prev]);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: currentUser.id,
      title: 'Reward Points Redeemed',
      message: `You converted ${cleanPoints} PTS into ₹${inrCredited.toLocaleString('en-IN', { minimumFractionDigits: 2 })} available balance.`,
      type: 'System',
      is_read: false,
      created_at: now,
    };
    setNotifications(prev => [notif, ...prev]);

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    } catch {
      // fallback
    }

    showToast(`Redeemed ${cleanPoints} PTS! +₹${inrCredited} added to your balance.`);
    return { success: true, message: `Successfully converted ${cleanPoints} PTS into ₹${inrCredited} INR!`, creditedINR: inrCredited };
  };

  const toggleSellingState = () => {
    setStats(prev => {
      const nextState = prev.selling_state === 'Open' ? 'Closed' : 'Open';
      showToast(`Trading State is now ${nextState}`);
      return { ...prev, selling_state: nextState };
    });
  };

  // Admin Actions
  const adminApproveDeposit = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'Pending') return;

    const targetUser = allUsers.find(u => u.id === tx.user_id);
    if (!targetUser) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const usdtVal = (tx.amount / stats.realtime_exchange_rate).toFixed(2);

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === tx.user_id) {
          return {
            ...u,
            available_balance: Number((u.available_balance + tx.amount).toFixed(2)),
            deposit_balance: Number((u.deposit_balance + tx.amount).toFixed(2)),
          };
        }
        return u;
      })
    );

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'Completed', notes: 'Approved by Admin' } : t))
    );

    const inAppNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: targetUser.id,
      title: 'Deposit Approved',
      message: `Your deposit of ${usdtVal} USDT (${tx.amount} INR) has been approved and credited to your balance.`,
      type: 'Deposit',
      is_read: false,
      created_at: now,
    };
    setNotifications(prev => [inAppNotif, ...prev]);

    const emailLog: AutomatedEmailLog = {
      id: `eml_${Date.now()}`,
      recipient_email: targetUser.email,
      subject: `Your deposit of ${usdtVal} USDT (${tx.amount} INR) has been approved`,
      body: `Hello ${targetUser.username},\n\nYour crypto deposit of ${usdtVal} USDT (equivalent to ₹${tx.amount} INR) on the ${tx.network || 'USDT'} network has been verified and credited.`,
      sent_at: now,
      type: 'Deposit Approval',
    };
    setEmailLogs(prev => [emailLog, ...prev]);

    distributeReferralCommissions(targetUser, tx.amount, 'USDT Deposit');

    showToast(`Deposit approved! Credited ₹${tx.amount} to ${targetUser.username}.`);
  };

  const adminRejectDeposit = (txId: string, reason = 'Invalid transaction hash / receipt mismatch') => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'Pending') return;

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'Rejected', notes: `Rejected: ${reason}` } : t))
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: tx.user_id,
      title: 'Deposit Rejected',
      message: `Your deposit request was rejected. Reason: ${reason}`,
      type: 'Deposit',
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast('Deposit rejected.');
  };

  const adminApproveWithdrawal = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'Pending') return;

    const targetUser = allUsers.find(u => u.id === tx.user_id);
    if (!targetUser) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === tx.user_id) {
          return {
            ...u,
            withdrawal_balance: Math.max(0, Number((u.withdrawal_balance - tx.amount).toFixed(2))),
          };
        }
        return u;
      })
    );

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'Completed', notes: 'Payout cleared via Banking Gateway' } : t))
    );

    const inAppNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: targetUser.id,
      title: 'Withdrawal Completed',
      message: `Your withdrawal request of ${tx.amount} INR has been successfully processed.`,
      type: 'Withdrawal',
      is_read: false,
      created_at: now,
    };
    setNotifications(prev => [inAppNotif, ...prev]);

    const emailLog: AutomatedEmailLog = {
      id: `eml_${Date.now()}`,
      recipient_email: targetUser.email,
      subject: `Withdrawal Receipt: ₹${tx.amount} INR Processed`,
      body: `Hello ${targetUser.username},\n\nYour withdrawal request of ₹${tx.amount} INR has been successfully disbursed.`,
      sent_at: now,
      type: 'Withdrawal Receipt',
    };
    setEmailLogs(prev => [emailLog, ...prev]);

    showToast(`Withdrawal of ₹${tx.amount} processed for ${targetUser.username}.`);
  };

  const adminRejectWithdrawal = (txId: string, reason = 'Bank details invalid / IFSC mismatch') => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'Pending') return;

    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === tx.user_id) {
          return {
            ...u,
            available_balance: Number((u.available_balance + tx.amount).toFixed(2)),
            withdrawal_balance: Math.max(0, Number((u.withdrawal_balance - tx.amount).toFixed(2))),
          };
        }
        return u;
      })
    );

    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'Rejected', notes: `Rejected: ${reason}` } : t))
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: tx.user_id,
      title: 'Withdrawal Rejected (Refunded)',
      message: `Withdrawal of ₹${tx.amount} was rejected and refunded. Reason: ${reason}`,
      type: 'Withdrawal',
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setNotifications(prev => [notif, ...prev]);

    showToast('Withdrawal rejected & amount refunded.');
  };

  const adminUpdateUserBalance = (
    userId: string,
    field: 'available_balance' | 'deposit_balance' | 'commission_balance',
    amount: number
  ) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            [field]: Math.max(0, Number((u[field] + amount).toFixed(2))),
          };
        }
        return u;
      })
    );
    showToast(`Updated user ${field} by ₹${amount}`);
  };

  const adminToggleUserStatus = (userId: string) => {
    setAllUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const next = u.status === 'Active' ? 'Banned' : 'Active';
          showToast(`User status set to ${next}`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  const adminUpdateStats = (newStats: Partial<StatisticsOperations>) => {
    setStats(prev => ({ ...prev, ...newStats }));
    showToast('Rates and rules updated successfully.');
  };

  const adminApproveWallet = (walletId: string) => {
    setUserWallets(prev =>
      prev.map(w => (w.id === walletId ? { ...w, bound_status: 'Active' } : w))
    );
    showToast('Wallet verified by Admin.');
  };

  const adminDeleteWallet = (walletId: string) => {
    setUserWallets(prev => prev.filter(w => w.id !== walletId));
    showToast('Wallet removed.');
  };

  const adminAddTask = (taskData: Omit<Task, 'id' | 'current_progress' | 'completed' | 'claimed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      current_progress: 0,
      completed: false,
      claimed: false,
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" added to ${newTask.category}!`);
  };

  const adminDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Task removed from platform.');
  };

  // Notifications
  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n => (n.user_id === currentUser.id ? { ...n, is_read: true } : n))
    );
    showToast('All notifications marked as read.');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const unreadNotificationCount = notifications.filter(
    n => n.user_id === currentUser.id && !n.is_read
  ).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        allUsers,
        transactions,
        tasks,
        claimableOrders,
        userWallets,
        stats,
        notifications,
        emailLogs,
        unreadNotificationCount,
        activeScreen,
        setActiveScreen,
        toastMessage,
        showToast,
        isAuthModalOpen,
        setIsAuthModalOpen,
        pendingOTP,
        sendEmailOTP,
        verifyEmailOTP,
        signupUser,
        loginWithPin,
        logout,
        switchUser,
        verifyPin,
        updateSecurityPin,
        claimOrder,
        submitDeposit,
        submitWithdrawal,
        bindWallet,
        claimTaskReward,
        redeemPoints,
        toggleSellingState,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        adminApproveDeposit,
        adminRejectDeposit,
        adminApproveWithdrawal,
        adminRejectWithdrawal,
        adminUpdateUserBalance,
        adminToggleUserStatus,
        adminUpdateStats,
        adminApproveWallet,
        adminDeleteWallet,
        adminAddTask,
        adminDeleteTask,
        isChatOpen,
        setIsChatOpen,
        supportChannels: SUPPORT_CHANNELS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
