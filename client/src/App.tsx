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
import InventoryManagement from "@/pages/InventoryManagement";
import DealerDashboard from "@/pages/DealerDashboard";
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
          <Route path="/inventory" component={InventoryManagement} />
          <Route path="/dashboard" component={DealerDashboard} />
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
