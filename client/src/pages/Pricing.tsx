import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import type { PriceTable } from "@shared/schema";

export default function Pricing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: priceTables = [], isLoading } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
  });

  const activePriceTables = priceTables.filter((table: PriceTable) => table.isActive);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="lg:pl-64">
          <div className="p-6">
            <div className="animate-pulse space-y-8">
              <div className="text-center">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto max-w-2xl"></div>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <div className="p-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Select the perfect plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          {activePriceTables.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No pricing plans available
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Pricing plans are currently being updated. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
              {activePriceTables.map((priceTable: PriceTable) => (
                <Card key={priceTable.id} className="relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
                  {priceTable.image1 && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={priceTable.image1} 
                        alt={priceTable.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {priceTable.title}
                      </CardTitle>
                      {priceTable.subtitle && (
                        <p className="text-gray-600 dark:text-gray-300">
                          {priceTable.subtitle}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {priceTable.advantages && priceTable.advantages.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          What's included:
                        </h4>
                        <ul className="space-y-2">
                          {priceTable.advantages.map((advantage, index) => (
                            <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              {advantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-center space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          {priceTable.oldPrice && (
                            <span className="text-2xl text-gray-500 line-through">
                              ${priceTable.oldPrice}
                            </span>
                          )}
                          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                            ${priceTable.currentPrice}
                          </span>
                        </div>
                        {priceTable.oldPrice && parseFloat(priceTable.oldPrice) > parseFloat(priceTable.currentPrice) && (
                          <Badge variant="destructive" className="text-xs">
                            Save ${(parseFloat(priceTable.oldPrice) - parseFloat(priceTable.currentPrice)).toFixed(2)}
                          </Badge>
                        )}
                      </div>

                      {priceTable.image2 && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                          <img 
                            src={priceTable.image2} 
                            alt={`${priceTable.title} preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {priceTable.buyLink && (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => window.open(priceTable.buyLink, '_blank')}
                        >
                          Get Started
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <p className="text-gray-600 dark:text-gray-400">
              Need a custom solution? 
              <a href="mailto:sales@company.com" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}