import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Copy, DollarSign, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PriceTableDialog } from "@/components/price-tables/PriceTableDialog";
import type { PriceTable } from "@shared/schema";

export function PriceTablesSection() {
  const [selectedPriceTable, setSelectedPriceTable] = useState<PriceTable | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: priceTables = [], isLoading } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/price-tables/${id}`, {
        method: "DELETE",
        headers: { 'x-user-id': '1' },
      });
      if (!response.ok) {
        throw new Error('Failed to delete price table');
      }
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

  const handleCreate = () => {
    setSelectedPriceTable(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (priceTable: PriceTable) => {
    setSelectedPriceTable(priceTable);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (priceTable: PriceTable) => {
    // Create a duplicate with modified title and reset ID
    const duplicatedTable = {
      ...priceTable,
      id: 0, // Reset ID for new entry
      title: `${priceTable.title} (Copy)`,
      isActive: false, // Set as inactive by default
      createdAt: null,
      updatedAt: null
    };
    setSelectedPriceTable(duplicatedTable);
    setIsDialogOpen(true);
  };

  const handleDelete = (priceTable: PriceTable) => {
    if (confirm(`Are you sure you want to delete "${priceTable.title}"?`)) {
      deleteMutation.mutate(priceTable.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPriceTable(null);
  };

  const activePlans = priceTables.filter(table => table.isActive);
  const totalRevenue = priceTables.reduce((sum, table) => sum + parseFloat(table.currentPrice), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Price Tables</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Price Tables</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage pricing plans and subscription tiers</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Price Table
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceTables.length}</div>
            <p className="text-xs text-muted-foreground">
              {activePlans.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${priceTables.length ? (totalRevenue / priceTables.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Combined pricing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {priceTables.map((priceTable: PriceTable) => (
          <Card key={priceTable.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{priceTable.title}</CardTitle>
                  {priceTable.subtitle && (
                    <CardDescription>{priceTable.subtitle}</CardDescription>
                  )}
                </div>
                <Badge variant={priceTable.isActive ? "default" : "secondary"}>
                  {priceTable.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  ${priceTable.currentPrice}
                  {priceTable.oldPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${priceTable.oldPrice}
                    </span>
                  )}
                </div>
                
                {priceTable.advantages && priceTable.advantages.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Features ({priceTable.advantages.length}):
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {priceTable.advantages.slice(0, 2).map((advantage, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          {advantage.length > 30 ? `${advantage.substring(0, 30)}...` : advantage}
                        </li>
                      ))}
                      {priceTable.advantages.length > 2 && (
                        <li className="text-xs text-gray-500">
                          +{priceTable.advantages.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(priceTable)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(priceTable)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Duplicate this price table"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(priceTable)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {priceTables.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No price tables found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Get started by creating your first pricing plan.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Price Table
            </Button>
          </CardContent>
        </Card>
      )}

      <PriceTableDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        priceTable={selectedPriceTable}
      />
    </div>
  );
}