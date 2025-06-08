import { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { PriceTablesSection } from './PriceTablesSection';
import { PublicPricingSection } from './PublicPricingSection';
import { CustomerPlansSection } from './CustomerPlansSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DashboardStats } from '@/lib/types';

const stats: DashboardStats[] = [
  {
    title: 'Total Users',
    value: '12,847',
    change: '↗ 12%',
    changeType: 'positive',
    icon: '👥',
    iconColor: 'blue'
  },
  {
    title: 'System Health',
    value: '99.9%',
    change: 'Online',
    changeType: 'positive',
    icon: '💓',
    iconColor: 'green'
  },
  {
    title: 'Revenue',
    value: '$284,567',
    change: '↗ 8%',
    changeType: 'positive',
    icon: '💰',
    iconColor: 'purple'
  },
  {
    title: 'Active Sessions',
    value: '1,847',
    change: 'Live',
    changeType: 'neutral',
    icon: '🌐',
    iconColor: 'orange'
  }
];

const recentActivity = [
  { name: 'John Doe', action: 'registered', time: '2 minutes ago', initials: 'JD', color: 'bg-blue-500' },
  { name: 'Sarah Miller', action: 'completed setup', time: '5 minutes ago', initials: 'SM', color: 'bg-green-500' },
  { name: 'Robert Johnson', action: 'upgraded plan', time: '1 hour ago', initials: 'RJ', color: 'bg-purple-500' }
];

const systemAlerts = [
  { type: 'warning', message: 'Database backup scheduled in 2 hours', icon: '⚠️' },
  { type: 'info', message: 'System update available', icon: 'ℹ️' },
  { type: 'success', message: 'Security scan completed', icon: '✅' }
];

export function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Dashboard Navigation Tabs */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Manage your platform with comprehensive oversight and control
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            📊 Dashboard Overview
          </TabsTrigger>
          <TabsTrigger 
            value="customer-plans" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            💳 Customer Plans
          </TabsTrigger>
          <TabsTrigger 
            value="pricing-management" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            💰 Price Tables
          </TabsTrigger>
          <TabsTrigger 
            value="public-pricing" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            👁️ Public Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <DashboardCard key={index} stats={stat} />
            ))}
          </div>

          {/* Activity and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent User Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${activity.color} text-white text-xs`}>
                          {activity.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.name} {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        alert.type === 'warning'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                          : alert.type === 'info'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{alert.icon}</span>
                        <span className={`text-sm ${
                          alert.type === 'warning'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : alert.type === 'info'
                            ? 'text-blue-800 dark:text-blue-200'
                            : 'text-green-800 dark:text-green-200'
                        }`}>
                          {alert.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer-plans">
          <CustomerPlansSection />
        </TabsContent>

        <TabsContent value="pricing-management">
          <PriceTablesSection />
        </TabsContent>

        <TabsContent value="public-pricing">
          <PublicPricingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
