import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { EntrepreneurDashboard } from '@/components/dashboard/EntrepreneurDashboard';
import { CollaboratorDashboard } from '@/components/dashboard/CollaboratorDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user.role) {
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'entrepreneur':
        return <EntrepreneurDashboard />;
      case 'collaborator':
        return <CollaboratorDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6">
          <div className="animate-in fade-in-50 duration-300">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
}
