import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: priceTables = [] } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
  });

  const form = useForm<CustomerPlanFormData>({
    resolver: zodResolver(customerPlanFormSchema),
    defaultValues: {
      customerId: 0,
      priceTableId: 0,
      planType: "3x",
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
        priceTableId: customerPlan.priceTableId,
        planType: customerPlan.planType as "3x" | "12x",
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
        priceTableId: 0,
        planType: "3x",
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
        const response = await fetch(`/api/customer-plans/${customerPlan.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error('Failed to update customer plan');
        return response.json();
      } else {
        const response = await fetch("/api/customer-plans", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error('Failed to create customer plan');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-plans"] });
      toast({
        title: "Success",
        description: `Customer plan ${customerPlan ? 'updated' : 'created'} successfully`,
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
  });

  const onSubmit = (data: CustomerPlanFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customerPlan ? 'Edit Customer Plan' : 'Create New Customer Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select
                value={form.watch("customerId")?.toString() || ""}
                onValueChange={(value) => form.setValue("customerId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.role === 'customer').map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceTableId">Price Table</Label>
              <Select
                value={form.watch("priceTableId")?.toString() || ""}
                onValueChange={(value) => form.setValue("priceTableId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price table" />
                </SelectTrigger>
                <SelectContent>
                  {priceTables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      {table.title} - {table.months}m
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Select
                value={form.watch("planType") || ""}
                onValueChange={(value) => form.setValue("planType", value as "3x" | "12x")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3x">3x Payment</SelectItem>
                  <SelectItem value="12x">12x Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                {...form.register("amount")}
                placeholder="Plan amount"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payStatus">Payment Status</Label>
              <Select
                value={form.watch("payStatus") || ""}
                onValueChange={(value) => form.setValue("payStatus", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payDate">Payment Date</Label>
              <Input
                {...form.register("payDate")}
                type="date"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payExpiration">Payment Expiration</Label>
              <Input
                {...form.register("payExpiration")}
                type="date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planExpirationDate">Plan Expiration</Label>
              <Input
                {...form.register("planExpirationDate")}
                type="date"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payHash">Payment Hash</Label>
              <Input
                {...form.register("payHash")}
                placeholder="Payment transaction hash"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payLink">Payment Link</Label>
              <Input
                {...form.register("payLink")}
                placeholder="Payment gateway link"
                type="url"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.watch("isActive") ?? true}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Active Plan</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : customerPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}