import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';

interface DashboardCardProps {
  stats: DashboardStats;
  children?: React.ReactNode;
}

const iconColorMap = {
  blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
  yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
  red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
};

export function DashboardCard({ stats, children }: DashboardCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.value}</p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconColorMap[stats.iconColor as keyof typeof iconColorMap]
          )}>
            <span className="text-xl">{stats.icon}</span>
          </div>
        </div>
        {stats.change && (
          <div className="mt-4 flex items-center">
            <span className={cn(
              "text-sm font-medium",
              stats.changeType === 'positive' ? 'text-green-500' :
              stats.changeType === 'negative' ? 'text-red-500' :
              'text-blue-500'
            )}>
              {stats.change}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">vs last month</span>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
