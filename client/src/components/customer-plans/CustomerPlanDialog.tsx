import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomerPlanSchema, updateCustomerPlanSchema, type CustomerPlanWithDetails, type User, type PriceTable } from "@shared/schema";

const customerPlanFormSchema = insertCustomerPlanSchema.extend({
  customerId: z.number().min(1, "Customer is required"),
  entrepreneurId: z.number().min(1, "Entrepreneur is required"),
  priceTableId: z.number().min(1, "Price table is required"),
  amount: z.string().min(1, "Amount is required"),
  payStatus: z.enum(['paid', 'pending', 'failed', 'expired']),
  payDate: z.string().optional(),
  payExpiration: z.string().optional(),
  planExpirationDate: z.string().optional(),
  payHash: z.string().optional(),
  payLink: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CustomerPlanFormData = z.infer<typeof customerPlanFormSchema>;

interface CustomerPlanDialogProps {
  open: boolean;
  onClose: () => void;
  customerPlan?: CustomerPlanWithDetails | null;
}

export function CustomerPlanDialog({ open, onClose, customerPlan }: CustomerPlanDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const { data: priceTables = [] } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
    enabled: open,
  });

  const customers = users.filter(user => user.role === 'customer');
  const entrepreneurs = users.filter(user => user.role === 'entrepreneur');

  const form = useForm<CustomerPlanFormData>({
    resolver: zodResolver(customerPlanFormSchema),
    defaultValues: {
      customerId: 0,
      entrepreneurId: 0,
      priceTableId: 0,
      amount: "",
      payStatus: "pending",
      payDate: "",
      payExpiration: "",
      planExpirationDate: "",
      payHash: "",
      payLink: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (customerPlan) {
      form.reset({
        customerId: customerPlan.customerId,
        entrepreneurId: customerPlan.entrepreneurId,
        priceTableId: customerPlan.priceTableId,
        amount: customerPlan.amount || "",
        payStatus: customerPlan.payStatus as any,
        payDate: customerPlan.payDate ? new Date(customerPlan.payDate).toISOString().split('T')[0] : "",
        payExpiration: customerPlan.payExpiration ? new Date(customerPlan.payExpiration).toISOString().split('T')[0] : "",
        planExpirationDate: customerPlan.planExpirationDate ? new Date(customerPlan.planExpirationDate).toISOString().split('T')[0] : "",
        payHash: customerPlan.payHash || "",
        payLink: customerPlan.payLink || "",
        isActive: customerPlan.isActive ?? true,
      });
    } else {
      form.reset({
        customerId: 0,
        entrepreneurId: 0,
        priceTableId: 0,
        amount: "",
        payStatus: "pending",
        payDate: "",
        payExpiration: "",
        planExpirationDate: "",
        payHash: "",
        payLink: "",
        isActive: true,
      });
    }
  }, [customerPlan, form]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerPlanFormData) => {
      const payload = {
        ...data,
        payDate: data.payDate ? new Date(data.payDate).toISOString() : null,
        payExpiration: data.payExpiration ? new Date(data.payExpiration).toISOString() : null,
        planExpirationDate: data.planExpirationDate ? new Date(data.planExpirationDate).toISOString() : null,
      };

      if (customerPlan) {
        return apiRequest(`/api/customer-plans/${customerPlan.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return apiRequest("/api/customer-plans", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-plans"] });
      toast({
        title: "Success",
        description: `Customer plan ${customerPlan ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${customerPlan ? "update" : "create"} customer plan`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerPlanFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customerPlan ? "Edit Customer Plan" : "Create Customer Plan"}
          </DialogTitle>
          <DialogDescription>
            {customerPlan 
              ? "Update the customer plan details below." 
              : "Fill out the form below to create a new customer plan."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} ({customer.email})
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
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entrepreneur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entrepreneurs.map((entrepreneur) => (
                          <SelectItem key={entrepreneur.id} value={entrepreneur.id.toString()}>
                            {entrepreneur.name} ({entrepreneur.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceTableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Table</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price table" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priceTables.map((table) => (
                          <SelectItem key={table.id} value={table.id.toString()}>
                            {table.title} - ${table.currentPrice3x} ({table.months}m)
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="0.00" type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                    <Textarea 
                      {...field} 
                      placeholder="Payment gateway link or reference"
                      className="min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending 
                  ? (customerPlan ? "Updating..." : "Creating...") 
                  : (customerPlan ? "Update Plan" : "Create Plan")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}