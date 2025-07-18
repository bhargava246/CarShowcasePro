import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import CarDetail from "@/pages/CarDetail";
import SearchResults from "@/pages/SearchResults";
import Compare from "@/pages/Compare";
import Dealers from "@/pages/Dealers";
import DealerProfile from "@/pages/DealerProfile";
import DealerDashboard from "@/pages/DealerDashboard";
import InventoryManagement from "@/pages/InventoryManagement";
import Analytics from "@/pages/Analytics";
import PricingTools from "@/pages/PricingTools";
import ListCars from "@/pages/ListCars";
import Wishlist from "@/pages/Wishlist";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/cars/:id" component={CarDetail} />
          <Route path="/search" component={SearchResults} />
          <Route path="/compare" component={Compare} />
          <Route path="/dealers" component={Dealers} />
          <Route path="/dealers/:id" component={DealerProfile} />
          <Route path="/dealer/dashboard" component={DealerDashboard} />
          <Route path="/dealer/inventory" component={InventoryManagement} />
          <Route path="/dealer/analytics" component={Analytics} />
          <Route path="/dealer/pricing" component={PricingTools} />
          <Route path="/dealer/list-cars" component={ListCars} />
          <Route path="/wishlist" component={Wishlist} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
