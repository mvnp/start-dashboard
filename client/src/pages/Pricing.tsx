import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PriceTable } from "@shared/schema";

export default function Pricing() {
  const { data: priceTables = [], isLoading } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
  });

  const activePriceTables = priceTables.filter((table: PriceTable) => table.isActive);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Select the perfect plan for your business needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {activePriceTables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              No pricing plans available at the moment.
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 xl:gap-12">
            {activePriceTables.map((priceTable: PriceTable) => (
              <Card 
                key={priceTable.id} 
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 border-2 hover:border-blue-500"
              >
                {/* Image 1 - Top centered */}
                {priceTable.image1 && (
                  <div className="flex justify-center pt-6">
                    <img 
                      src={priceTable.image1} 
                      alt={`${priceTable.title} illustration`}
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {priceTable.title}
                  </CardTitle>
                  {priceTable.subtitle && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {priceTable.subtitle}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Advantages */}
                  {priceTable.advantages && priceTable.advantages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                        What's Included
                      </h4>
                      <ul className="space-y-2">
                        {priceTable.advantages.map((advantage, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {advantage}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      {priceTable.oldPrice && (
                        <span className="text-2xl text-gray-400 line-through">
                          ${priceTable.oldPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        ${priceTable.currentPrice}
                      </span>
                    </div>
                    {priceTable.oldPrice && (
                      <Badge variant="destructive" className="text-xs">
                        Save ${(parseFloat(priceTable.oldPrice) - parseFloat(priceTable.currentPrice)).toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  {/* Image 2 - Bottom centered */}
                  {priceTable.image2 && (
                    <div className="flex justify-center">
                      <img 
                        src={priceTable.image2} 
                        alt={`${priceTable.title} features`}
                        className="w-24 h-24 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Buy Link Button */}
                  <div className="pt-4">
                    <Button 
                      asChild 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                    >
                      <a 
                        href={priceTable.buyLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2"
                      >
                        <span>Get Started</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
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
  );
}