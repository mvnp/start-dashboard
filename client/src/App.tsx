import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import PaymentGateways from "@/pages/PaymentGateways";
import Collaborators from "@/pages/Collaborators";
import WhatsappInstances from "@/pages/WhatsappInstances";
import CustomerPlans from "@/pages/CustomerPlans";
import PriceTables from "@/pages/PriceTables";
import PublicPricing from "@/pages/PublicPricing";
import Support from "@/pages/Support";
import SupportTickets from "@/pages/SupportTickets";
import Accounting from "@/pages/Accounting";

import MockDataGenerator from "@/pages/MockDataGenerator";
import NotFound from "@/pages/not-found";

function Router() {
  const { user } = useAuth();
  
  // Simple authentication check - in a real app this would check actual auth state
  const isAuthenticated = !!user;

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/users" component={Users} />
          <Route path="/payment-gateways" component={PaymentGateways} />
          <Route path="/collaborators" component={Collaborators} />
          <Route path="/whatsapp-instances" component={WhatsappInstances} />
          <Route path="/customer-plans" component={CustomerPlans} />
          <Route path="/price-tables" component={PriceTables} />
          <Route path="/public-pricing" component={PublicPricing} />
          <Route path="/support" component={Support} />
          <Route path="/support-tickets" component={SupportTickets} />
          <Route path="/accounting" component={Accounting} />

          <Route path="/mock-data" component={MockDataGenerator} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
