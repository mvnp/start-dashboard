import { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { PublicPricingSection } from './PublicPricingSection';
import { CustomerPlansSection } from './CustomerPlansSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DashboardStats } from '@/lib/types';

const stats: DashboardStats[] = [
  {
    title: 'Monthly Revenue',
    value: '$47,892',
    change: '↗ 15%',
    changeType: 'positive',
    icon: '💰',
    iconColor: 'green'
  },
  {
    title: 'Active Projects',
    value: '12',
    change: '3 new',
    changeType: 'neutral',
    icon: '📊',
    iconColor: 'blue'
  },
  {
    title: 'Team Members',
    value: '24',
    change: '2 hired',
    changeType: 'positive',
    icon: '👥',
    iconColor: 'purple'
  },
  {
    title: 'Customer Rating',
    value: '4.8',
    change: '4.8/5.0',
    changeType: 'positive',
    icon: '⭐',
    iconColor: 'yellow'
  }
];

const projects = [
  { name: 'E-commerce Platform', status: 'Active', color: 'green', due: 'Dec 15, 2024' },
  { name: 'Mobile App Development', status: 'In Progress', color: 'yellow', due: 'Jan 20, 2025' },
  { name: 'Brand Redesign', status: 'Planning', color: 'blue', due: 'Nov 30, 2024' }
];

export function EntrepreneurDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Entrepreneur Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Manage your business operations and view customer pricing
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            📊 Business Overview
          </TabsTrigger>
          <TabsTrigger 
            value="customer-plans" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            💳 Customer Plans
          </TabsTrigger>
          <TabsTrigger 
            value="public-pricing" 
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            👁️ Public Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <DashboardCard key={index} stats={stat} />
            ))}
          </div>

          {/* Projects and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          project.color === 'green' ? 'bg-green-500' :
                          project.color === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Due: {project.due}</p>
                        </div>
                      </div>
                      <Badge variant={
                        project.color === 'green' ? 'default' :
                        project.color === 'yellow' ? 'secondary' : 'outline'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-500 dark:text-gray-400">Revenue analytics chart</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Chart visualization would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer-plans">
          <CustomerPlansSection />
        </TabsContent>

        <TabsContent value="public-pricing">
          <PublicPricingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
