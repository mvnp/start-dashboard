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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { WhatsappInstance } from '@shared/schema';

const whatsappInstanceFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  instanceNumber: z.string().min(1, 'Instance number is required'),
  apiUrl: z.string().url('Invalid API URL'),
  isActive: z.boolean().default(true),
});

type WhatsappInstanceFormData = z.infer<typeof whatsappInstanceFormSchema>;

interface WhatsappInstanceDialogProps {
  open: boolean;
  onClose: () => void;
  instance?: WhatsappInstance | null;
}

export function WhatsappInstanceDialog({ open, onClose, instance }: WhatsappInstanceDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!instance;

  const form = useForm<WhatsappInstanceFormData>({
    resolver: zodResolver(whatsappInstanceFormSchema),
    defaultValues: {
      name: '',
      instanceNumber: '',
      apiUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (instance) {
      form.reset({
        name: instance.name,
        instanceNumber: instance.instanceNumber,
        apiUrl: instance.apiUrl,
        isActive: instance.isActive,
      });
    } else {
      form.reset({
        name: '',
        instanceNumber: '',
        apiUrl: '',
        isActive: true,
      });
    }
  }, [instance, form]);

  const mutation = useMutation({
    mutationFn: async (data: WhatsappInstanceFormData) => {
      if (isEditing) {
        return await apiRequest(`/api/whatsapp-instances/${instance.id}`, 'PUT', data);
      } else {
        return await apiRequest('/api/whatsapp-instances', 'POST', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-instances'] });
      toast({
        title: 'Success',
        description: `WhatsApp instance ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} WhatsApp instance`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: WhatsappInstanceFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit WhatsApp Instance' : 'Create New WhatsApp Instance'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter instance name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instanceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter instance number" {...field} />
                  </FormControl>
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
                      placeholder="https://api.whatsapp.com"
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
                      Active Instance
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this WhatsApp instance for operations
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
                {mutation.isPending ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}