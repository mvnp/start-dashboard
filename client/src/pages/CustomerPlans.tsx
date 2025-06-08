import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Edit, Trash2, CreditCard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { CustomerPlanDialog } from "@/components/customer-plans/CustomerPlanDialog";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { apiRequest } from "@/lib/queryClient";
import type { CustomerPlanWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function CustomerPlans() {
  const [selectedPlan, setSelectedPlan] = useState<CustomerPlanWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customerPlans = [], isLoading } = useQuery<CustomerPlanWithDetails[]>({
    queryKey: ["/api/customer-plans"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/customer-plans/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer plan');
      }
      return response.json();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActiveBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-blue-500">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };

  const handleEdit = (plan: CustomerPlanWithDetails) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = (plan: CustomerPlanWithDetails) => {
    if (window.confirm(`Are you sure you want to delete the plan for ${plan.customer.name}?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Plans</h1>
              <p className="text-muted-foreground">Manage customer subscription plans and payments</p>
            </div>
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Plans</h1>
            <p className="text-muted-foreground">
              Manage customer subscription plans and payments ({customerPlans.length} total)
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Customer Plan
          </Button>
        </div>

        {customerPlans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Customer Plans</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first customer plan
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Customer Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {customerPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{plan.priceTable.title}</CardTitle>
                      {getActiveBadge(plan.isActive ?? false)}
                      {getStatusBadge(plan.payStatus)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(plan)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{plan.priceTable.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="text-sm">{plan.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Entrepreneur</p>
                      <p className="text-sm">{plan.entrepreneur.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.entrepreneur.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount</p>
                      <p className="text-sm font-semibold">${plan.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.priceTable.months} months plan
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                      <p className="text-sm">
                        {plan.payDate ? format(new Date(plan.payDate), 'MMM dd, yyyy') : 'Not paid'}
                      </p>
                      {plan.planExpirationDate && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {format(new Date(plan.planExpirationDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {plan.payHash && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Payment Hash: <span className="font-mono">{plan.payHash.substring(0, 16)}...</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CustomerPlanDialog
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedPlan(null);
          }}
          customerPlan={selectedPlan}
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