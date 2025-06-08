import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { PaymentGateway } from '@shared/schema';

const paymentGatewayFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['asaas', 'mercado_pago', 'pagseguro']),
  apiUrl: z.string().url('Invalid API URL'),
  publicKey: z.string().min(1, 'Public key is required'),
  token: z.string().min(1, 'Token is required'),
  isActive: z.boolean().default(true),
});

type PaymentGatewayFormData = z.infer<typeof paymentGatewayFormSchema>;

interface PaymentGatewayDialogProps {
  open: boolean;
  onClose: () => void;
  gateway?: PaymentGateway | null;
}

export function PaymentGatewayDialog({ open, onClose, gateway }: PaymentGatewayDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!gateway;

  const form = useForm<PaymentGatewayFormData>({
    resolver: zodResolver(paymentGatewayFormSchema),
    defaultValues: {
      name: '',
      type: 'asaas',
      apiUrl: '',
      publicKey: '',
      token: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (gateway) {
      form.reset({
        name: gateway.name,
        type: gateway.type as any,
        apiUrl: gateway.apiUrl,
        publicKey: gateway.publicKey,
        token: gateway.token,
        isActive: gateway.isActive,
      });
    } else {
      form.reset({
        name: '',
        type: 'asaas',
        apiUrl: '',
        publicKey: '',
        token: '',
        isActive: true,
      });
    }
  }, [gateway, form]);

  const mutation = useMutation({
    mutationFn: async (data: PaymentGatewayFormData) => {
      if (isEditing) {
        return await apiRequest(`/api/payment-gateways/${gateway.id}`, 'PUT', data);
      } else {
        return await apiRequest('/api/payment-gateways', 'POST', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({
        title: 'Success',
        description: `Payment gateway ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} payment gateway`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PaymentGatewayFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Payment Gateway' : 'Create New Payment Gateway'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter gateway name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gateway type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="asaas">Asaas</SelectItem>
                      <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                      <SelectItem value="pagseguro">PagSeguro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://api.gateway.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter public key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter token"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Active Gateway
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this payment gateway for transactions
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? `${isEditing ? 'Updating' : 'Creating'}...`
                  : `${isEditing ? 'Update' : 'Create'} Gateway`
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}