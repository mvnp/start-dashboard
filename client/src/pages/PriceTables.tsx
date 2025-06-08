import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PriceTableDialog } from "@/components/price-tables/PriceTableDialog";
import { apiRequest } from "@/lib/queryClient";
import type { PriceTable } from "@shared/schema";

export default function PriceTables() {
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
        headers: { 'x-user-id': '1' }, // Super admin
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

  const handleDelete = (priceTable: PriceTable) => {
    if (confirm(`Are you sure you want to delete "${priceTable.title}"?`)) {
      deleteMutation.mutate(priceTable.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPriceTable(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Price Tables</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage pricing plans and subscription tiers
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Price Table
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex gap-2">
                  <Badge variant={priceTable.isActive ? "default" : "secondary"}>
                    {priceTable.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
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
                      Features:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {priceTable.advantages.slice(0, 3).map((advantage, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          {advantage}
                        </li>
                      ))}
                      {priceTable.advantages.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{priceTable.advantages.length - 3} more features
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
            <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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