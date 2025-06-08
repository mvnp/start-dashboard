import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye, DollarSign, Users, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CustomerPlanDialog } from "@/components/customer-plans/CustomerPlanDialog";
import type { CustomerPlanWithDetails } from "@shared/schema";
import { format } from "date-fns";

export function CustomerPlansSection() {
  const [selectedPlan, setSelectedPlan] = useState<CustomerPlanWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const { toast } = useToast();

  const { data: customerPlans = [], isLoading } = useQuery<CustomerPlanWithDetails[]>({
    queryKey: ["/api/customer-plans"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customer-plans/${id}`, {
        method: "DELETE",
        headers: { 'x-user-id': '1' },
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer plan');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-plans"] });
      toast({
        title: "Success",
        description: "Customer plan deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer plan",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: CustomerPlanWithDetails) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = (plan: CustomerPlanWithDetails) => {
    if (confirm(`Are you sure you want to delete this customer plan?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activePlans = customerPlans.filter(plan => plan.isActive && plan.payStatus === 'paid');
  const totalRevenue = customerPlans
    .filter(plan => plan.payStatus === 'paid')
    .reduce((sum, plan) => sum + parseFloat(plan.amount || '0'), 0);
  const displayedPlans = showAllPlans ? customerPlans : customerPlans.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Plans</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Plans</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage customer subscriptions and purchased plans</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer Plan
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              {activePlans.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From paid plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Plans</CardTitle>
          <CardDescription>Latest customer plan activities</CardDescription>
        </CardHeader>
        <CardContent>
          {customerPlans.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No customer plans found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get started by creating your first customer plan.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Customer Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{plan.priceTable.title}</h4>
                      {getStatusBadge(plan.payStatus)}
                      {plan.isActive && <Badge variant="outline">Active</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Customer: {plan.customer.name}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Plan: {plan.planType}</span>
                      <span>Amount: R$ {plan.amount}</span>
                      {plan.payDate && (
                        <span>Paid: {format(new Date(plan.payDate), 'dd/MM/yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {plan.payLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(plan.payLink!, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {customerPlans.length > 5 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllPlans(!showAllPlans)}
                  >
                    {showAllPlans ? 'Show Recent Only' : `View All ${customerPlans.length} Plans`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerPlanDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        customerPlan={selectedPlan}
      />
    </div>
  );
}