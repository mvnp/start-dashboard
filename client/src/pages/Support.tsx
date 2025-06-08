import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Phone, 
  MapPin, 
  Globe, 
  MessageSquare, 
  Mail, 
  Clock, 
  Send,
  Building2,
  User,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// Support form schema
const supportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.enum(["technical", "billing", "feature", "bug", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

// Enterprise information (this would normally come from a settings API)
const enterpriseInfo = {
  businessName: "TechSolutions Enterprise",
  address: "123 Innovation Drive, Tech Valley, TV 12345",
  contactPhone: "+1 (555) 123-4567",
  whatsappNumber: "+1 (555) 987-6543",
  websiteUrl: "https://techsolutions-enterprise.com",
  supportEmail: "support@techsolutions-enterprise.com",
  businessHours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
  logo: "/enterprise-logo.svg" // Placeholder path
};

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      category: "general",
      priority: "medium",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SupportFormData) => {
      // Simulate API call to submit support ticket
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error('Failed to submit support ticket');
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Support Ticket Submitted",
        description: "We've received your request and will respond within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportFormData) => {
    submitMutation.mutate(data);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical": return <AlertCircle className="h-4 w-4" />;
      case "billing": return <Building2 className="h-4 w-4" />;
      case "feature": return <CheckCircle className="h-4 w-4" />;
      case "bug": return <AlertCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
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
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Enterprise Header */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div>
                      <CardTitle className="text-3xl font-bold mb-2">
                        {enterpriseInfo.businessName}
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-lg">
                        Enterprise Support Center
                      </CardDescription>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{enterpriseInfo.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{enterpriseInfo.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp: {enterpriseInfo.whatsappNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={enterpriseInfo.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {enterpriseInfo.websiteUrl}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enterprise Logo */}
                  <div className="hidden md:flex items-center">
                    <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-white" />
                      {/* Replace with actual logo: <img src={enterpriseInfo.logo} alt="Enterprise Logo" className="w-20 h-20 object-contain" /> */}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Support Email</p>
                      <p className="text-sm text-muted-foreground">{enterpriseInfo.supportEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">{enterpriseInfo.businessHours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Contact Support
                    </CardTitle>
                    <CardDescription>
                      Submit a support ticket and our team will get back to you promptly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Ticket Submitted Successfully!</h3>
                        <p className="text-muted-foreground mb-4">
                          We've received your support request and will respond within 24 hours.
                        </p>
                        <Button onClick={() => setIsSubmitted(false)}>
                          Submit Another Ticket
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              {...form.register("name")}
                              placeholder="Enter your full name"
                            />
                            {form.formState.errors.name && (
                              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              {...form.register("email")}
                              type="email"
                              placeholder="Enter your email address"
                            />
                            {form.formState.errors.email && (
                              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              {...form.register("phone")}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                              value={form.watch("category")}
                              onValueChange={(value) => form.setValue("category", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technical">Technical Support</SelectItem>
                                <SelectItem value="billing">Billing & Payments</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="general">General Inquiry</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority Level *</Label>
                            <Select
                              value={form.watch("priority")}
                              onValueChange={(value) => form.setValue("priority", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 flex items-end">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Priority:</span>
                              <Badge 
                                variant="secondary" 
                                className={`${getPriorityColor(form.watch("priority"))} text-white`}
                              >
                                {form.watch("priority").charAt(0).toUpperCase() + form.watch("priority").slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            {...form.register("subject")}
                            placeholder="Brief description of your issue"
                          />
                          {form.formState.errors.subject && (
                            <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            {...form.register("message")}
                            placeholder="Please provide detailed information about your issue or request..."
                            rows={6}
                          />
                          {form.formState.errors.message && (
                            <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            disabled={submitMutation.isPending}
                            className="min-w-32"
                          >
                            {submitMutation.isPending ? (
                              <>Submitting...</>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Ticket
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Help Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Common Issues</h4>
                      <div className="space-y-2 text-sm">
                        <button className="text-left text-blue-600 hover:underline block">
                          Password reset instructions
                        </button>
                        <button className="text-left text-blue-600 hover:underline block">
                          Billing and payment questions
                        </button>
                        <button className="text-left text-blue-600 hover:underline block">
                          Account setup guidance
                        </button>
                        <button className="text-left text-blue-600 hover:underline block">
                          Technical troubleshooting
                        </button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Emergency Contact</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          For urgent issues outside business hours:
                        </p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">{enterpriseInfo.contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{enterpriseInfo.whatsappNumber}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Support Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">98%</p>
                        <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">2h</p>
                        <p className="text-xs text-muted-foreground">Avg. Response</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}