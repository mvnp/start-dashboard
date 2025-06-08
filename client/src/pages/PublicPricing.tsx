import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ExternalLink, Star, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import type { PriceTable } from "@shared/schema";

export default function PublicPricing() {
  const [is12MonthPlan, setIs12MonthPlan] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: priceTables = [], isLoading } = useQuery<PriceTable[]>({
    queryKey: ["/api/price-tables"],
  });

  const activePriceTables = priceTables
    .filter((table: PriceTable) => table.isActive)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      );
    }

    if (activePriceTables.length === 0) {
      return (
        <div className="text-center py-16">
          <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No pricing plans available
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pricing plans are currently being updated. Please check back soon.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan that fits your needs. Upgrade or downgrade at any time.
          </p>
          
          {/* Plan Duration Toggle */}
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className={`text-sm font-medium ${!is12MonthPlan ? 'text-blue-600' : 'text-gray-500'}`}>
              3-Month Plan
            </span>
            <Switch
              checked={is12MonthPlan}
              onCheckedChange={setIs12MonthPlan}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm font-medium ${is12MonthPlan ? 'text-blue-600' : 'text-gray-500'}`}>
              12-Month Plan
            </span>
            {is12MonthPlan && (
              <Badge variant="secondary" className="ml-2">
                Best Value
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activePriceTables.map((priceTable: PriceTable, index) => {
            const isPopular = index === 1; // Middle plan is popular
            
            return (
              <Card 
                key={priceTable.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isPopular ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                    <Star className="inline w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                )}

                {/* Header Image */}
                {priceTable.image1 && (
                  <div className={`aspect-video w-full overflow-hidden ${isPopular ? 'mt-10' : ''}`}>
                    <img 
                      src={priceTable.image1} 
                      alt={priceTable.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className={`text-center ${isPopular && !priceTable.image1 ? 'pt-12' : 'pt-6'}`}>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {priceTable.title}
                    </CardTitle>
                    {priceTable.subtitle && (
                      <p className="text-gray-600 dark:text-gray-300">
                        {priceTable.subtitle}
                      </p>
                    )}
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                      Duration: {priceTable.months} months
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  {priceTable.advantages && priceTable.advantages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          What's included:
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {priceTable.advantages.map((advantage, index) => (
                          <li key={index} className="flex items-start text-gray-600 dark:text-gray-300">
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      {(() => {
                        const currentPrice = is12MonthPlan ? priceTable.currentPrice12x : priceTable.currentPrice3x;
                        const oldPrice = is12MonthPlan ? priceTable.oldPrice12x : priceTable.oldPrice3x;
                        const hasDiscount = oldPrice && parseFloat(oldPrice) > parseFloat(currentPrice);
                        
                        return (
                          <>
                            <div className="flex items-center justify-center gap-2">
                              {hasDiscount && (
                                <span className="text-xl text-gray-500 line-through">
                                  ${oldPrice}
                                </span>
                              )}
                              <span className={`text-4xl font-bold ${isPopular ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                                ${currentPrice}
                              </span>
                            </div>
                            {hasDiscount && (
                              <Badge variant="destructive" className="text-xs">
                                Save ${(parseFloat(oldPrice!) - parseFloat(currentPrice)).toFixed(2)}
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Preview Image */}
                    {priceTable.image2 && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <img 
                          src={priceTable.image2} 
                          alt={`${priceTable.title} preview`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* CTA Button */}
                    {priceTable.buyLink && (
                      <Button 
                        className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Need a custom solution?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Contact our sales team for enterprise pricing and custom features.
          </p>
          <Button variant="outline" onClick={() => window.open('mailto:sales@company.com', '_blank')}>
            Contact Sales
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
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