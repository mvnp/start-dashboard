import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Search, MessageSquare, CheckCircle, XCircle, QrCode, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { WhatsappInstanceDialog } from '@/components/whatsapp-instances/WhatsappInstanceDialog';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import type { WhatsappInstance } from '@shared/schema';

export default function WhatsappInstances() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<WhatsappInstance | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ [key: number]: string }>({});

  const { data: instances = [], isLoading } = useQuery<WhatsappInstance[]>({
    queryKey: ['/api/whatsapp-instances'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/whatsapp-instances/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-instances'] });
      toast({
        title: 'Success',
        description: 'WhatsApp instance deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete WhatsApp instance',
        variant: 'destructive',
      });
    },
  });

  const qrCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/whatsapp-instances/${id}/qrcode`, 'POST');
      return { id, data: response };
    },
    onSuccess: ({ id, data }) => {
      setQrCodeData(prev => ({ ...prev, [id]: data.qrCode || data.qr_code || data.qrCodeBase64 }));
      toast({
        title: 'Success',
        description: 'QR code generated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    },
  });

  const filteredInstances = instances.filter((instance) =>
    instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.instanceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingInstance(null);
  };

  const handleEdit = (instance: WhatsappInstance) => {
    setEditingInstance(instance);
    setDialogOpen(true);
  };

  const handleDelete = (instance: WhatsappInstance) => {
    if (window.confirm(`Are you sure you want to delete "${instance.name}"?`)) {
      deleteMutation.mutate(instance.id);
    }
  };

  const handleGenerateQR = (instance: WhatsappInstance) => {
    qrCodeMutation.mutate(instance.id);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WhatsApp Instances</h1>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WhatsApp Instances</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Instance
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search instances..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instances.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Instances</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instances.filter((i) => i.isActive).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instances.filter((i) => !i.isActive).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Inactive</div>
            </CardContent>
          </Card>
        </div>

        {/* Instances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstances.map((instance) => (
            <Card key={instance.id} className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{instance.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">#{instance.instanceNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {instance.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${instance.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {instance.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span className="truncate">API: {instance.apiUrl}</span>
                  </div>
                </div>

                {/* QR Code Display Area - 200x200 pixels */}
                <div className="mb-4">
                  <div className="w-[200px] h-[200px] mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    {qrCodeData[instance.id] ? (
                      <img 
                        src={qrCodeData[instance.id]} 
                        alt="QR Code" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <QrCode className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">No QR Code</p>
                        <p className="text-xs">Click button to generate</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateQR(instance)}
                    disabled={qrCodeMutation.isPending}
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {qrCodeMutation.isPending ? 'Generating...' : 'Get QR Code'}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(instance)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(instance)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInstances.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No instances found matching your search.' : 'No WhatsApp instances found.'}
              </div>
            </CardContent>
          </Card>
        )}

        <WhatsappInstanceDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          instance={editingInstance}
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