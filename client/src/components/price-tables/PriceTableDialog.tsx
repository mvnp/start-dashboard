import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertPriceTableSchema, type PriceTable } from "@shared/schema";

const priceTableFormSchema = insertPriceTableSchema;

type PriceTableFormData = z.infer<typeof priceTableFormSchema>;

interface PriceTableDialogProps {
  open: boolean;
  onClose: () => void;
  priceTable?: PriceTable | null;
}

export function PriceTableDialog({ open, onClose, priceTable }: PriceTableDialogProps) {
  const [advantages, setAdvantages] = useState<string[]>([]);
  const { toast } = useToast();
  const isUpdate = priceTable && priceTable.id > 0;

  const form = useForm<PriceTableFormData>({
    resolver: zodResolver(priceTableFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      currentPrice: "0",
      oldPrice: "",
      image1: "",
      image2: "",
      buyLink: "",
      displayOrder: 0,
      isActive: true,
      advantages: [],
    },
  });

  useEffect(() => {
    if (priceTable) {
      form.reset({
        title: priceTable.title,
        subtitle: priceTable.subtitle || "",
        currentPrice: priceTable.currentPrice.toString(),
        oldPrice: priceTable.oldPrice || "",
        image1: priceTable.image1 || "",
        image2: priceTable.image2 || "",
        buyLink: priceTable.buyLink || "",
        displayOrder: priceTable.displayOrder || 0,
        isActive: priceTable.isActive || true,
      });
      setAdvantages(priceTable.advantages || []);
    } else {
      form.reset({
        title: "",
        subtitle: "",
        currentPrice: "0",
        oldPrice: "",
        image1: "",
        image2: "",
        buyLink: "",
        displayOrder: 0,
        isActive: true,
      });
      setAdvantages([]);
    }
  }, [priceTable, form]);

  const mutation = useMutation({
    mutationFn: async (data: PriceTableFormData) => {
      const payload = {
        ...data,
        advantages,
      };

      const url = isUpdate ? `/api/price-tables/${priceTable.id}` : "/api/price-tables";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'x-user-id': '1', // Super admin
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(isUpdate ? "Failed to update price table" : "Failed to create price table");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-tables"] });
      toast({
        title: "Success",
        description: isUpdate ? "Price table updated successfully" : "Price table created successfully",
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

  const onSubmit = (data: PriceTableFormData) => {
    mutation.mutate(data);
  };

  const addAdvantage = () => {
    setAdvantages([...advantages, ""]);
  };

  const updateAdvantage = (index: number, value: string) => {
    const newAdvantages = [...advantages];
    newAdvantages[index] = value;
    setAdvantages(newAdvantages);
  };

  const removeAdvantage = (index: number) => {
    setAdvantages(advantages.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {priceTable ? "Edit Price Table" : "Create Price Table"}
          </DialogTitle>
          <DialogDescription>
            {priceTable 
              ? "Update the pricing plan details below." 
              : "Create a new pricing plan for your customers."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Basic Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Perfect for small teams" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Advantages</FormLabel>
              {advantages.map((advantage, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={advantage}
                    onChange={(e) => updateAdvantage(index, e.target.value)}
                    placeholder="Enter an advantage..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdvantage(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAdvantage}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Advantage
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="29.99" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oldPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="39.99" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Optional - shows strikethrough pricing</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image1.jpg" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Image displayed at the top of the pricing card</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image2.jpg" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Image displayed before the purchase button</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Link</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://checkout.example.com/plan" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>URL where customers can purchase this plan</FormDescription>
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
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Show this pricing plan on the public pricing page
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending 
                  ? (priceTable ? "Updating..." : "Creating...") 
                  : (priceTable ? "Update" : "Create")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}