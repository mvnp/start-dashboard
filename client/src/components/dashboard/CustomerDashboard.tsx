import { DashboardCard } from './DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

const stats: DashboardStats[] = [
  {
    title: 'Total Orders',
    value: '47',
    change: '3 recent',
    changeType: 'positive',
    icon: '🛒',
    iconColor: 'blue'
  },
  {
    title: 'Total Spent',
    value: '$2,847',
    change: '↗ $247',
    changeType: 'positive',
    icon: '💰',
    iconColor: 'green'
  },
  {
    title: 'Loyalty Points',
    value: '1,250',
    change: '+150',
    changeType: 'positive',
    icon: '⭐',
    iconColor: 'purple'
  },
  {
    title: 'Support Tickets',
    value: '2',
    change: '1 resolved',
    changeType: 'positive',
    icon: '🎧',
    iconColor: 'orange'
  }
];

const orders = [
  { product: 'Premium Headphones', order: 'ORD-2024-1247', price: '$199.99', status: 'Delivered', icon: '📦' },
  { product: 'Designer T-Shirt', order: 'ORD-2024-1246', price: '$45.00', status: 'Shipping', icon: '👕' },
  { product: 'Programming Book Set', order: 'ORD-2024-1245', price: '$89.99', status: 'Processing', icon: '📚' }
];

const favorites = [
  { product: 'Wireless Mouse', category: 'Electronics', color: 'from-blue-400 to-blue-600' },
  { product: 'Coffee Mug', category: 'Home & Kitchen', color: 'from-green-400 to-green-600' },
  { product: 'Notebook Set', category: 'Office Supplies', color: 'from-purple-400 to-purple-600' }
];

export function CustomerDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <DashboardCard key={index} stats={stat} />
        ))}
      </div>

      {/* Orders and Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{order.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{order.product}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.order}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.price}</p>
                    <Badge variant={
                      order.status === 'Delivered' ? 'default' :
                      order.status === 'Shipping' ? 'secondary' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Favorite Products */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {favorites.map((favorite, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-12 h-12 bg-gradient-to-br ${favorite.color} rounded-lg`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{favorite.product}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{favorite.category}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
