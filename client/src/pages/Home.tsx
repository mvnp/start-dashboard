import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Users, CreditCard, UserCheck, BarChart3, TrendingUp, Activity } from "lucide-react";

const roleGreetings = {
  'super-admin': 'Welcome to the Super Admin Dashboard',
  'entrepreneur': 'Welcome to Your Business Dashboard',
  'collaborator': 'Welcome to Your Workspace',
  'customer': 'Welcome to Your Account'
};

const roleDescriptions = {
  'super-admin': 'Monitor and manage all platform activities, users, and businesses.',
  'entrepreneur': 'Manage your business operations, team members, and payment systems.',
  'collaborator': 'Access your assigned projects and collaborate with your team.',
  'customer': 'View your account information and manage your preferences.'
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'super-admin':
        return [
          { icon: Users, label: "Manage Users", description: "View and manage all platform users", href: "/users" },
          { icon: CreditCard, label: "Payment Gateways", description: "Monitor all payment integrations", href: "/payment-gateways" },
          { icon: UserCheck, label: "Collaborators", description: "Oversee all collaborator activities", href: "/collaborators" },
          { icon: BarChart3, label: "Analytics", description: "Platform-wide analytics and insights", href: "/dashboard" }
        ];
      case 'entrepreneur':
        return [
          { icon: Users, label: "My Team", description: "Manage your team members", href: "/users" },
          { icon: CreditCard, label: "Payment Setup", description: "Configure payment gateways", href: "/payment-gateways" },
          { icon: UserCheck, label: "Collaborators", description: "Manage project collaborators", href: "/collaborators" },
          { icon: TrendingUp, label: "Business Analytics", description: "Your business performance", href: "/dashboard" }
        ];
      case 'collaborator':
        return [
          { icon: Activity, label: "My Projects", description: "View assigned projects", href: "/dashboard" },
          { icon: Users, label: "Team Members", description: "Connect with team members", href: "/users" },
          { icon: UserCheck, label: "Collaboration", description: "Manage collaborations", href: "/collaborators" }
        ];
      case 'customer':
        return [
          { icon: Activity, label: "My Account", description: "Manage account settings", href: "/dashboard" },
          { icon: Users, label: "Support", description: "Contact support team", href: "/users" }
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {roleGreetings[user.role]}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Hello, {user.name}! {roleDescriptions[user.role]}
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-lg text-gray-900 dark:text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-end">
                <Button onClick={handleLogout} variant="outline">
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                        <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{action.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{action.description}</p>
                    {action.href && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = action.href}
                        className="w-full"
                      >
                        Open
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Role-specific Information */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.role === 'super-admin' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Super Admin Access</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    You have full platform access to manage all users, businesses, and system configurations across all tenants.
                  </p>
                </div>
              )}
              
              {user.role === 'entrepreneur' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Business Owner</h4>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Manage your business operations, team members, and payment integrations. Your data is securely isolated from other businesses.
                  </p>
                </div>
              )}
              
              {user.role === 'collaborator' && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Team Collaborator</h4>
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    Work on assigned projects and collaborate with your team. Access is limited to your business environment.
                  </p>
                </div>
              )}
              
              {user.role === 'customer' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Customer Account</h4>
                  <p className="text-orange-800 dark:text-orange-200 text-sm">
                    Access your account information and interact with the services you're subscribed to.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}