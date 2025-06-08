import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Clock, User, Mail, Phone, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { SupportTicketWithAssignee } from "@shared/schema";

const responseFormSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  resolution: z.string().min(1, "Response is required"),
});

type ResponseFormData = z.infer<typeof responseFormSchema>;

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: XCircle
};

interface TicketResponseDialogProps {
  ticket: SupportTicketWithAssignee;
  open: boolean;
  onClose: () => void;
}

function TicketResponseDialog({ ticket, open, onClose }: TicketResponseDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      status: ticket.status as "open" | "in_progress" | "resolved" | "closed",
      resolution: ticket.resolution || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ResponseFormData) => {
      const response = await fetch(`/api/support-tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          resolvedAt: data.status === "resolved" ? new Date() : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResponseFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Respond to Ticket #{ticket.ticketId}</DialogTitle>
          <DialogDescription>
            Ticket from {ticket.name} ({ticket.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">{ticket.subject}</h4>
            <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Category: {ticket.category}</span>
              <span>Priority: {ticket.priority}</span>
              <span>Created: {format(new Date(ticket.createdAt!), "MMM dd, yyyy HH:mm")}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your response to the customer..."
                        className="min-h-[120px]"
                        {...field}
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
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Ticket"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SupportTickets() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketWithAssignee | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: tickets = [], isLoading } = useQuery<SupportTicketWithAssignee[]>({
    queryKey: ["/api/support-tickets"],
  });

  const handleRespond = (ticket: SupportTicketWithAssignee) => {
    setSelectedTicket(ticket);
    setResponseDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setResponseDialogOpen(false);
    setSelectedTicket(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer support requests and responses
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">
                  {tickets.filter((t: SupportTicketWithAssignee) => t.status === 'open').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {tickets.filter((t: SupportTicketWithAssignee) => t.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">
                  {tickets.filter((t: SupportTicketWithAssignee) => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold">
                  {tickets.filter((t: SupportTicketWithAssignee) => t.status === 'closed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No support tickets</h3>
            <p className="text-muted-foreground">
              All support tickets will appear here when customers submit them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: SupportTicketWithAssignee) => {
            const StatusIcon = statusIcons[ticket.status as keyof typeof statusIcons];
            
            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        #{ticket.ticketId}
                      </CardTitle>
                      <CardDescription className="font-medium">
                        {ticket.subject}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {ticket.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {ticket.email}
                    </div>
                    {ticket.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {ticket.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(ticket.createdAt!), "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                  
                  <p className="text-sm line-clamp-2">{ticket.message}</p>
                  
                  {ticket.resolution && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Response:</p>
                      <p className="text-sm">{ticket.resolution}</p>
                      {ticket.resolvedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Resolved on {format(new Date(ticket.resolvedAt), "MMM dd, yyyy HH:mm")}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Category: {ticket.category} | 
                      {ticket.assignee ? ` Assigned to: ${ticket.assignee.name}` : ' Unassigned'}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleRespond(ticket)}
                      className="ml-auto"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {ticket.status === 'resolved' || ticket.status === 'closed' ? 'View' : 'Respond'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

            {selectedTicket && (
              <TicketResponseDialog
                ticket={selectedTicket}
                open={responseDialogOpen}
                onClose={handleCloseDialog}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}