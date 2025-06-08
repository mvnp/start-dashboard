import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Edit, Trash2, Globe, Check, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import type { PriceTable } from "@shared/schema";

export default function PublicPricing() {
  const [selectedTable, setSelectedTable] = useState<PriceTable | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: priceTables = [], isLoading } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
  });

  const togglePublicMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/price-tables/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error('Failed to update public status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-tables"] });
      toast({
        title: "Success",
        description: "Public pricing status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update public status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/price-tables/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error('Failed to delete price table');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-tables"] });
      toast({
        title: "Success",
        description: "Price table deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete price table",
        variant: "destructive",
      });
    },
  });

  const handleTogglePublic = (table: PriceTable) => {
    togglePublicMutation.mutate({ id: table.id, isActive: table.isActive ?? false });
  };

  const handleEdit = (table: PriceTable) => {
    setSelectedTable(table);
    setIsDialogOpen(true);
  };

  const handleDelete = (table: PriceTable) => {
    if (window.confirm(`Are you sure you want to delete the price table "${table.title}"?`)) {
      deleteMutation.mutate(table.id);
    }
  };

  const publicTables = priceTables.filter(table => table.isActive);
  const privateTables = priceTables.filter(table => !table.isActive);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Public Pricing</h1>
              <p className="text-muted-foreground">Manage public-facing pricing displays</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Public Pricing</h1>
            <p className="text-muted-foreground">
              Manage public-facing pricing displays ({publicTables.length} public, {privateTables.length} private)
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Price Table
          </Button>
        </div>

        {/* Public Pricing Tables */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Public Pricing Plans</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {publicTables.length} Active
            </Badge>
          </div>
          
          {publicTables.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Public Pricing Plans</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Make some price tables public to display them on your website
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTables.map((table) => (
                <Card key={table.id} className="border-green-200 bg-green-50/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{table.title}</CardTitle>
                        <Badge variant="default" className="bg-green-500">Public</Badge>
                        <Badge variant="secondary">{table.months}m</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTogglePublic(table)}>
                            <X className="h-4 w-4 mr-2" />
                            Make Private
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(table)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(table)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{table.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">3x Payment</span>
                        <span className="font-semibold text-lg">${table.currentPrice3x}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">12x Payment</span>
                        <span className="font-semibold text-lg">${table.currentPrice12x}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="font-semibold">{table.months} months</span>
                      </div>
                    </div>

                    {table.advantages && table.advantages.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Key Features</p>
                        <div className="space-y-1">
                          {table.advantages.slice(0, 3).map((advantage, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              <p className="text-xs text-muted-foreground">{advantage}</p>
                            </div>
                          ))}
                          {table.advantages.length > 3 && (
                            <p className="text-xs text-muted-foreground ml-5">
                              +{table.advantages.length - 3} more features
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Private Pricing Tables */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Private Price Tables</h2>
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              {privateTables.length} Hidden
            </Badge>
          </div>
          
          {privateTables.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground text-center">
                  All price tables are currently public
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateTables.map((table) => (
                <Card key={table.id} className="border-gray-200 bg-gray-50/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg text-gray-600">{table.title}</CardTitle>
                        <Badge variant="outline">Private</Badge>
                        <Badge variant="secondary">{table.months}m</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTogglePublic(table)}>
                            <Check className="h-4 w-4 mr-2" />
                            Make Public
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(table)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(table)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-gray-500">{table.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">3x Payment</span>
                        <span className="font-semibold">${table.currentPrice3x}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">12x Payment</span>
                        <span className="font-semibold">${table.currentPrice12x}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="font-semibold">{table.months} months</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
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
          <div className="animate-in fade-in-50 duration-300">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}