import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, CreditCard, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { login } = useAuth();
  
  const handleLogin = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">DashBoard</span>
          </div>
          <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Multi-Tenant SaaS Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Comprehensive dashboard for managing users, collaborators, and payment gateways across multiple business environments.
          </p>
          <Button 
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive user management with role-based access control for different business needs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Real-time analytics and insights tailored to your role and business requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Payment Gateways</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage multiple payment gateways with secure API integration and monitoring.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">Multi-Tenant Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Enterprise-grade security with data isolation and role-based permissions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using our platform to manage their operations efficiently.
          </p>
          <Button 
            onClick={handleLogin}
            variant="outline"
            className="bg-white text-blue-600 hover:bg-gray-50 border-white text-lg px-8 py-3"
          >
            Sign In Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © 2025 DashBoard Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}