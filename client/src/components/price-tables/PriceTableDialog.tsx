import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPriceTableSchema } from "@shared/schema";
import type { PriceTable } from "@shared/schema";
import { z } from "zod";

const priceTableFormSchema = insertPriceTableSchema.extend({
  advantages: z.array(z.string()).default([]),
});

type PriceTableFormData = z.infer<typeof priceTableFormSchema>;

interface PriceTableDialogProps {
  open: boolean;
  onClose: () => void;
  priceTable?: PriceTable | null;
}

export function PriceTableDialog({ open, onClose, priceTable }: PriceTableDialogProps) {
  const [advantages, setAdvantages] = useState<string[]>([""]);
  const { toast } = useToast();

  const form = useForm<PriceTableFormData>({
    resolver: zodResolver(priceTableFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      advantages: [""],
      oldPrice: "",
      currentPrice: "",
      image1: "",
      image2: "",
      buyLink: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  useEffect(() => {
    if (priceTable) {
      form.reset({
        title: priceTable.title,
        subtitle: priceTable.subtitle || "",
        advantages: priceTable.advantages || [""],
        oldPrice: priceTable.oldPrice || "",
        currentPrice: priceTable.currentPrice,
        image1: priceTable.image1 || "",
        image2: priceTable.image2 || "",
        buyLink: priceTable.buyLink,
        isActive: priceTable.isActive,
        displayOrder: priceTable.displayOrder,
      });
      setAdvantages(priceTable.advantages || [""]);
    } else {
      form.reset({
        title: "",
        subtitle: "",
        advantages: [""],
        oldPrice: "",
        currentPrice: "",
        image1: "",
        image2: "",
        buyLink: "",
        isActive: true,
        displayOrder: 0,
      });
      setAdvantages([""]);
    }
  }, [priceTable, form]);

  const mutation = useMutation({
    mutationFn: async (data: PriceTableFormData) => {
      const payload = {
        ...data,
        advantages: advantages.filter(advantage => advantage.trim() !== ""),
        oldPrice: data.oldPrice || null,
        subtitle: data.subtitle || null,
        image1: data.image1 || null,
        image2: data.image2 || null,
      };

      if (priceTable) {
        return await apiRequest(`/api/price-tables/${priceTable.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'x-user-id': '1', // Super admin
          },
          body: JSON.stringify(payload),
        });
      } else {
        return await apiRequest("/api/price-tables", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-user-id': '1', // Super admin
          },
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-tables"] });
      toast({
        title: "Success",
        description: `Price table ${priceTable ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${priceTable ? "update" : "create"} price table`,
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

  const removeAdvantage = (index: number) => {
    if (advantages.length > 1) {
      setAdvantages(advantages.filter((_, i) => i !== index));
    }
  };

  const updateAdvantage = (index: number, value: string) => {
    const newAdvantages = [...advantages];
    newAdvantages[index] = value;
    setAdvantages(newAdvantages);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {priceTable ? "Edit Price Table" : "Create Price Table"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Basic Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Perfect for individuals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>Advantages</FormLabel>
              {advantages.map((advantage, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter advantage"
                    value={advantage}
                    onChange={(e) => updateAdvantage(index, e.target.value)}
                    className="flex-1"
                  />
                  {advantages.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAdvantage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdvantage}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Advantage
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="oldPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Price</FormLabel>
                    <FormControl>
                      <Input placeholder="99.99" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price *</FormLabel>
                    <FormControl>
                      <Input placeholder="49.99" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image 1 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image1.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image 2 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image2.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Link *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://checkout.example.com/plan-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0 pt-6">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : priceTable ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}