export enum BusinessType {
  FREELANCER = 'Freelancer',
  ONLINE_SELLER = 'Online Seller',
  SMALL_SHOP_OWNER = 'Small Shop Owner',
  AGENCY_OWNER = 'Agency Owner',
  SERVICE_PROVIDER = 'Service Provider'
}

export interface UserProfile {
  id: string;
  businessName: string;
  businessType: BusinessType;
  currency: string;
  onboarded: boolean;
  createdAt: Date;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: Date;
  userId: string;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  userId: string;
  impact?: string;
}

export interface Memory {
  id: string;
  content: string;
  date: Date;
  type: 'insight' | 'pattern' | 'routine';
  userId: string;
}
