import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Search, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PaymentGatewayDialog } from '@/components/payment-gateways/PaymentGatewayDialog';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import type { PaymentGateway } from '@shared/schema';

const gatewayTypeLabels = {
  'asaas': 'Asaas',
  'mercado_pago': 'Mercado Pago',
  'pagseguro': 'PagSeguro'
};

const gatewayTypeColors = {
  'asaas': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  'mercado_pago': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  'pagseguro': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
};

export default function PaymentGateways() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: gateways = [], isLoading } = useQuery<PaymentGateway[]>({
    queryKey: ['/api/payment-gateways', user.role, user.id],
  });

  const deleteGatewayMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/payment-gateways/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({
        title: 'Success',
        description: 'Payment gateway deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete payment gateway',
        variant: 'destructive',
      });
    },
  });

  const filteredGateways = gateways.filter((gateway) =>
    gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gateway.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setDialogOpen(true);
  };

  const handleDelete = (gateway: PaymentGateway) => {
    if (confirm(`Are you sure you want to delete ${gateway.name}?`)) {
      deleteGatewayMutation.mutate(gateway.id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGateway(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Gateways</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Gateways</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gateway
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search gateways..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{gateways.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Gateways</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {gateways.filter((g) => g.isActive).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {gateways.filter((g) => g.type === 'asaas').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Asaas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {gateways.filter((g) => g.type === 'mercado_pago').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Mercado Pago</div>
            </CardContent>
          </Card>
        </div>

        {/* Gateways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGateways.map((gateway) => (
            <Card key={gateway.id} className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{gateway.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{gateway.apiUrl}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge className={gatewayTypeColors[gateway.type as keyof typeof gatewayTypeColors]}>
                    {gatewayTypeLabels[gateway.type as keyof typeof gatewayTypeLabels]}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {gateway.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${gateway.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {gateway.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="truncate">Public Key: {gateway.publicKey.slice(0, 20)}...</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(gateway)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(gateway)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGateways.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No payment gateways found matching your search.' : 'No payment gateways found.'}
              </div>
            </CardContent>
          </Card>
        )}

        <PaymentGatewayDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          gateway={editingGateway}
        />
      </div>
    );
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
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}