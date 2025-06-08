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
import { useToast } from '@/hooks/use-toast';
import type { Collaborator } from '@shared/schema';

const collaboratorFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
});

type CollaboratorFormData = z.infer<typeof collaboratorFormSchema>;

interface CollaboratorDialogProps {
  open: boolean;
  onClose: () => void;
  collaborator?: Collaborator | null;
}

export function CollaboratorDialog({ open, onClose, collaborator }: CollaboratorDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!collaborator;

  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      position: '',
    },
  });

  useEffect(() => {
    if (collaborator) {
      form.reset({
        name: collaborator.name,
        email: collaborator.email,
        department: collaborator.department,
        position: collaborator.position,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        department: '',
        position: '',
      });
    }
  }, [collaborator, form]);

  const mutation = useMutation({
    mutationFn: async (data: CollaboratorFormData) => {
      if (isEditing) {
        return await apiRequest(`/api/collaborators/${collaborator.id}`, 'PUT', data);
      } else {
        return await apiRequest('/api/collaborators', 'POST', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborators'] });
      toast({
        title: 'Success',
        description: `Collaborator ${isEditing ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} collaborator`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CollaboratorFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Collaborator' : 'Create New Collaborator'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter collaborator name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter department"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter position"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                  : `${isEditing ? 'Update' : 'Create'} Collaborator`
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}