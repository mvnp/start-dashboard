import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertCustomerPlanSchema, type CustomerPlanWithDetails, type User, type PriceTable } from "@shared/schema";

const customerPlanFormSchema = insertCustomerPlanSchema.extend({
  payDate: z.string().optional(),
  payExpiration: z.string().optional(),
  planExpirationDate: z.string().optional(),
});

type CustomerPlanFormData = z.infer<typeof customerPlanFormSchema>;

interface CustomerPlanDialogProps {
  open: boolean;
  onClose: () => void;
  customerPlan?: CustomerPlanWithDetails | null;
}

export function CustomerPlanDialog({ open, onClose, customerPlan }: CustomerPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch users for customer and entrepreneur dropdowns
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  // Fetch price tables for plan selection
  const { data: priceTables = [] } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
    enabled: open,
  });

  const form = useForm<CustomerPlanFormData>({
    resolver: zodResolver(customerPlanFormSchema),
    defaultValues: {
      customerId: 0,
      entrepreneurId: 0,
      priceTableId: 0,
      planType: "3x",
      amount: "0.00",
      payHash: "",
      payStatus: "pending",
      payDate: "",
      payLink: "",
      payExpiration: "",
      planExpirationDate: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or customerPlan changes
  useEffect(() => {
    if (open) {
      if (customerPlan) {
        form.reset({
          customerId: customerPlan.customerId,
          entrepreneurId: customerPlan.entrepreneurId,
          priceTableId: customerPlan.priceTableId,
          planType: customerPlan.planType as "3x" | "12x",
          amount: customerPlan.amount,
          payHash: customerPlan.payHash || "",
          payStatus: customerPlan.payStatus,
          payDate: customerPlan.payDate ? new Date(customerPlan.payDate).toISOString().split('T')[0] : "",
          payLink: customerPlan.payLink || "",
          payExpiration: customerPlan.payExpiration ? new Date(customerPlan.payExpiration).toISOString().split('T')[0] : "",
          planExpirationDate: customerPlan.planExpirationDate ? new Date(customerPlan.planExpirationDate).toISOString().split('T')[0] : "",
          isActive: customerPlan.isActive,
        });
      } else {
        form.reset({
          customerId: 0,
          entrepreneurId: 0,
          priceTableId: 0,
          planType: "3x",
          amount: "0.00",
          payHash: "",
          payStatus: "pending",
          payDate: "",
          payLink: "",
          payExpiration: "",
          planExpirationDate: "",
          isActive: true,
        });
      }
    }
  }, [open, customerPlan, form]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerPlanFormData) => {
      setIsLoading(true);
      
      // Convert date strings to proper format
      const formattedData = {
        ...data,
        payDate: data.payDate ? new Date(data.payDate).toISOString() : null,
        payExpiration: data.payExpiration ? new Date(data.payExpiration).toISOString() : null,
        planExpirationDate: data.planExpirationDate ? new Date(data.planExpirationDate).toISOString() : null,
        amount: data.amount,
      };

      if (customerPlan) {
        return apiRequest(`/api/customer-plans/${customerPlan.id}`, {
          method: "PUT",
          body: JSON.stringify(formattedData),
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': '1'
          },
        });
      } else {
        return apiRequest("/api/customer-plans", {
          method: "POST",
          body: JSON.stringify(formattedData),
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': '1'
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-plans"] });
      toast({
        title: "Success",
        description: customerPlan ? "Customer plan updated successfully" : "Customer plan created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${customerPlan ? 'update' : 'create'} customer plan`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: CustomerPlanFormData) => {
    mutation.mutate(data);
  };

  // Watch for price table and plan type changes to auto-update amount
  const watchedPriceTableId = form.watch("priceTableId");
  const watchedPlanType = form.watch("planType");

  useEffect(() => {
    if (watchedPriceTableId && watchedPlanType) {
      const selectedTable = priceTables.find(table => table.id === watchedPriceTableId);
      if (selectedTable) {
        const price = watchedPlanType === "3x" ? selectedTable.currentPrice3x : selectedTable.currentPrice12x;
        form.setValue("amount", price);
      }
    }
  }, [watchedPriceTableId, watchedPlanType, priceTables, form]);

  const customers = users.filter(user => user.role === 'customer');
  const entrepreneurs = users.filter(user => user.role === 'entrepreneur');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customerPlan ? "Edit Customer Plan" : "Create Customer Plan"}
          </DialogTitle>
          <DialogDescription>
            {customerPlan 
              ? "Update the customer plan information below." 
              : "Create a new customer plan by filling out the form below."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entrepreneurId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrepreneur</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entrepreneur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entrepreneurs.map((entrepreneur) => (
                          <SelectItem key={entrepreneur.id} value={entrepreneur.id.toString()}>
                            {entrepreneur.name} - {entrepreneur.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceTableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Table</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price table" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priceTables.map((table) => (
                          <SelectItem key={table.id} value={table.id.toString()}>
                            {table.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3x">3 months</SelectItem>
                        <SelectItem value="12x">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Hash</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Payment transaction hash" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Link</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://payment-link.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="payDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payExpiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Expiration</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planExpirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Expiration</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Active Plan
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this customer plan
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : customerPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}