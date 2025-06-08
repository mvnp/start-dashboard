import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, Settings, Shield, Database, FileText, Briefcase, TrendingUp, DollarSign, Calendar, CheckSquare, MessageSquare, Clock, FileIcon, ShoppingCart, Heart, User, CreditCard, Headphones, Star, Menu, X, Wallet, LogOut, Code2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import type { UserRole, NavigationItem } from '@/lib/types';

const navigationMenus: Record<UserRole, NavigationItem[]> = {
  'super-admin': [
    { icon: 'BarChart3', label: 'Dashboard', href: '/dashboard', active: true },
    { icon: 'Users', label: 'User Management', href: '/users' },
    { icon: 'Wallet', label: 'Payment Gateways', href: '/payment-gateways' },
    { icon: 'MessageSquare', label: 'WhatsApp Instances', href: '/whatsapp-instances' },
    { icon: 'CreditCard', label: 'Customer Plans', href: '/customer-plans' },
    { icon: 'DollarSign', label: 'Price Tables', href: '/price-tables' },
    { icon: 'Globe', label: 'Public Pricing', href: '/public-pricing' },
    { icon: 'Headphones', label: 'Support', href: '/support' },

    { icon: 'Code2', label: 'Mock Data Generator', href: '/mock-data' },
    { icon: 'Settings', label: 'System Settings' },
    { icon: 'TrendingUp', label: 'Analytics' },
    { icon: 'Shield', label: 'Security' },
    { icon: 'Database', label: 'Database' },
    { icon: 'FileText', label: 'Reports' }
  ],
  'entrepreneur': [
    { icon: 'BarChart3', label: 'Dashboard', href: '/dashboard', active: true },
    { icon: 'Briefcase', label: 'My Business' },
    { icon: 'Users', label: 'Collaborators', href: '/collaborators' },
    { icon: 'Wallet', label: 'Payment Gateways', href: '/payment-gateways' },
    { icon: 'MessageSquare', label: 'WhatsApp Instances', href: '/whatsapp-instances' },
    { icon: 'CreditCard', label: 'Customer Plans', href: '/customer-plans' },
    { icon: 'DollarSign', label: 'Price Tables', href: '/price-tables' },
    { icon: 'Globe', label: 'Public Pricing', href: '/public-pricing' },
    { icon: 'Headphones', label: 'Support', href: '/support' },
    { icon: 'TrendingUp', label: 'Analytics' },
    { icon: 'DollarSign', label: 'Revenue' },
    { icon: 'FileIcon', label: 'Projects' },
    { icon: 'Calendar', label: 'Schedule' }
  ],
  'collaborator': [
    { icon: 'BarChart3', label: 'Dashboard', active: true },
    { icon: 'CheckSquare', label: 'My Tasks' },
    { icon: 'FileIcon', label: 'Projects' },
    { icon: 'MessageSquare', label: 'Messages' },
    { icon: 'Headphones', label: 'Support', href: '/support' },
    { icon: 'Calendar', label: 'Calendar' },
    { icon: 'Clock', label: 'Time Tracking' },
    { icon: 'FileText', label: 'Documents' }
  ],
  'customer': [
    { icon: 'BarChart3', label: 'Dashboard', active: true },
    { icon: 'ShoppingCart', label: 'My Orders' },
    { icon: 'Heart', label: 'Favorites' },
    { icon: 'User', label: 'Profile' },
    { icon: 'CreditCard', label: 'Billing' },
    { icon: 'Headphones', label: 'Support', href: '/support' },
    { icon: 'Star', label: 'Reviews' }
  ]
};

const iconMap = {
  BarChart3,
  Users,
  Settings,
  Shield,
  Database,
  FileText,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckSquare,
  MessageSquare,
  Clock,
  FileIcon,
  ShoppingCart,
  Heart,
  User,
  CreditCard,
  Headphones,
  Star,
  Wallet,
  Code2
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, setUserRole, logout } = useAuth();
  const { theme } = useTheme();
  const [location] = useLocation();

  if (!user) return null;

  const menuItems = navigationMenus[user.role];

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-white dark:bg-gray-800 w-64 min-h-screen shadow-lg transition-all duration-300 ease-in-out fixed lg:relative z-50 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">DashBoard</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Role
          </label>
          <Select value={user.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super-admin">Super Admin</SelectItem>
              <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
              <SelectItem value="collaborator">Collaborator</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = item.href ? location === item.href : item.active;
              const content = (
                <>
                  {getIcon(item.icon)}
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 w-full p-3 rounded-lg text-left transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    onClick={onClose}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 w-full p-3 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => {
              console.log('Logout button clicked');
              logout();
              console.log('Logout function called');
            }}
            variant="outline"
            className="w-full flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  );
}
