import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  Receipt,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import type { Accounting } from "@shared/schema";

const accountingFormSchema = z.object({
  entrepreneurId: z.number(),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["receives", "expenses"]),
  amount: z.string().min(1, "Amount is required"),
});

type AccountingFormData = z.infer<typeof accountingFormSchema>;

interface AccountingDialogProps {
  open: boolean;
  onClose: () => void;
  accounting?: Accounting | null;
}

function AccountingDialog({ open, onClose, accounting }: AccountingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AccountingFormData>({
    resolver: zodResolver(accountingFormSchema),
    defaultValues: {
      entrepreneurId: 2, // Default to current entrepreneur
      category: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      type: "receives",
      amount: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AccountingFormData) => {
      const payload = {
        ...data,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
      };

      if (accounting) {
        const response = await fetch(`/api/accounting/${accounting.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { 
            "Content-Type": "application/json",
            "x-user-id": "2"
          },
        });
        if (!response.ok) throw new Error('Failed to update accounting entry');
        return response.json();
      } else {
        const response = await fetch("/api/accounting", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { 
            "Content-Type": "application/json",
            "x-user-id": "2"
          },
        });
        if (!response.ok) throw new Error('Failed to create accounting entry');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting"] });
      toast({
        title: "Success",
        description: `Entry ${accounting ? 'updated' : 'created'} successfully`,
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountingFormData) => {
    mutation.mutate(data);
  };

  // Reset form when dialog opens with existing data
  React.useEffect(() => {
    if (accounting && open) {
      form.reset({
        entrepreneurId: accounting.entrepreneurId,
        category: accounting.category,
        description: accounting.description,
        date: accounting.date ? new Date(accounting.date).toISOString().split('T')[0] : "",
        type: accounting.type as "receives" | "expenses",
        amount: accounting.amount,
      });
    } else if (!accounting && open) {
      form.reset({
        entrepreneurId: 2,
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        type: "receives",
        amount: "",
      });
    }
  }, [accounting, open, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {accounting ? 'Edit Accounting Entry' : 'New Accounting Entry'}
          </DialogTitle>
          <DialogDescription>
            Add financial records to track your business income and expenses.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receives">Income/Receives</SelectItem>
                        <SelectItem value="expenses">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Sales Revenue, Office Expenses"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detailed description of the transaction"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : accounting ? 'Update Entry' : 'Create Entry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Accounting() {
  const [selectedEntry, setSelectedEntry] = useState<Accounting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accountingEntries = [], isLoading } = useQuery<Accounting[]>({
    queryKey: ["/api/accounting"],
    queryFn: () => fetch("/api/accounting?entrepreneurId=2", {
      headers: { "x-user-id": "2" }
    }).then(res => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/accounting/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "2" },
      });
      if (!response.ok) {
        throw new Error('Failed to delete accounting entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting"] });
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (entry: Accounting) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = (entry: Accounting) => {
    if (window.confirm(`Are you sure you want to delete this ${entry.type} entry?`)) {
      deleteMutation.mutate(entry.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEntry(null);
  };

  // Calculate totals
  const totalReceives = accountingEntries
    .filter(entry => entry.type === 'receives')
    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  const totalExpenses = accountingEntries
    .filter(entry => entry.type === 'expenses')
    .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  const netIncome = totalReceives - totalExpenses;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-muted-foreground mt-2">
              Track your business income and expenses
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Receives</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalReceives.toFixed(2)}
                  </p>
                </div>
                <ArrowUpCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${totalExpenses.toFixed(2)}
                  </p>
                </div>
                <ArrowDownCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                  <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netIncome.toFixed(2)}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounting Entries List */}
        {accountingEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No accounting entries</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your business finances by adding your first entry.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {accountingEntries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{entry.category}</CardTitle>
                          <Badge 
                            variant={entry.type === 'receives' ? 'default' : 'destructive'}
                            className={entry.type === 'receives' ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {entry.type === 'receives' ? 'Income' : 'Expense'}
                          </Badge>
                        </div>
                        <CardDescription>{entry.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${entry.type === 'receives' ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.type === 'receives' ? '+' : '-'}${parseFloat(entry.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(entry)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.type === 'receives' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {entry.type === 'receives' ? 'Income' : 'Expense'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        <AccountingDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          accounting={selectedEntry}
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