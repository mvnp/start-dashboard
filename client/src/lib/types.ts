export type UserRole = 'super-admin' | 'entrepreneur' | 'collaborator' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface NavigationItem {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
}

export interface DashboardStats {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor: string;
}
