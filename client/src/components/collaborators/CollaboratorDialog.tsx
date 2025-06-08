import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertCollaboratorSchema } from "@shared/schema";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Collaborator } from "@shared/schema";

const collaboratorFormSchema = insertCollaboratorSchema.extend({
  skills: z.string().optional(),
  hireDate: z.date().optional(),
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
  const isEdit = !!collaborator;

  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      phone: "",
      skills: "",
      isActive: true,
      hireDate: new Date(),
    },
  });

  useEffect(() => {
    if (collaborator) {
      form.reset({
        name: collaborator.name,
        email: collaborator.email,
        role: collaborator.role,
        department: collaborator.department || "",
        phone: collaborator.phone || "",
        skills: collaborator.skills || "",
        isActive: collaborator.isActive,
        hireDate: collaborator.hireDate ? new Date(collaborator.hireDate) : new Date(),
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "",
        department: "",
        phone: "",
        skills: "",
        isActive: true,
        hireDate: new Date(),
      });
    }
  }, [collaborator, form]);

  const mutation = useMutation({
    mutationFn: async (data: CollaboratorFormData) => {
      const url = isEdit ? `/api/collaborators/${collaborator.id}` : "/api/collaborators";
      const method = isEdit ? "PUT" : "POST";
      
      // Convert skills array back to comma-separated string
      const payload = {
        ...data,
        skills: data.skills || "",
        hireDate: data.hireDate?.toISOString(),
      };
      
      return apiRequest(url, method, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaborators"] });
      toast({
        title: "Success",
        description: `Collaborator ${isEdit ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} collaborator`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CollaboratorFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Collaborator" : "Add New Collaborator"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title/Role *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Developer, Designer" {...field} />
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
                      <Input placeholder="e.g., Engineering, Marketing" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter skills separated by commas (e.g., React, Node.js, Python, Design)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hire Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Is this collaborator currently active?
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
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? `${isEdit ? "Updating" : "Creating"}...`
                  : `${isEdit ? "Update" : "Create"} Collaborator`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}