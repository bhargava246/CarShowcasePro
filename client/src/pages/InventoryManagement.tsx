import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCarSchema, type Car } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Plus, Package, TrendingUp, Eye, Edit, Trash2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: cars, isLoading } = useQuery({
    queryKey: ["/api/cars"],
  });

  const { data: dealers } = useQuery({
    queryKey: ["/api/dealers"],
  });

  const addCarMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cars", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({ title: "Car added successfully" });
      setIsAddCarOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error adding car", variant: "destructive" });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/cars/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({ title: "Car updated successfully" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertCarSchema.extend({
      imageUrls: insertCarSchema.shape.imageUrls.default([]),
      features: insertCarSchema.shape.features.default([]),
    })),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      fuelType: "gasoline",
      transmission: "automatic",
      bodyType: "sedan",
      drivetrain: "fwd",
      condition: "used",
      dealerId: 1,
      available: true,
      description: "",
    },
  });

  const filteredCars = cars?.filter((car: Car) => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "available" && car.available) ||
                         (statusFilter === "sold" && !car.available);
    return matchesSearch && matchesStatus;
  }) || [];

  const inventoryStats = {
    total: cars?.length || 0,
    available: cars?.filter((car: Car) => car.available).length || 0,
    sold: cars?.filter((car: Car) => !car.available).length || 0,
    value: cars?.reduce((sum: number, car: Car) => sum + parseFloat(car.price.toString()), 0) || 0,
  };

  const onSubmit = (data: any) => {
    addCarMutation.mutate(data);
  };

  const updateCarStatus = (carId: number, available: boolean) => {
    updateCarMutation.mutate({ id: carId, available });
  };

  const getStatusBadge = (car: Car) => {
    if (!car.available) return <Badge variant="destructive">Sold</Badge>;
    return <Badge variant="default">Available</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your car inventory and track sales</p>
        </div>
        <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Car</DialogTitle>
              <DialogDescription>
                Add a new car to your inventory
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="cvt">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddCarOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addCarMutation.isPending}>
                    {addCarMutation.isPending ? "Adding..." : "Add Car"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inventoryStats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inventoryStats.sold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(inventoryStats.value)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search cars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cars Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car: Car) => (
            <Card key={car.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {car.imageUrls && car.imageUrls.length > 0 ? (
                  <img 
                    src={car.imageUrls[0]} 
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No Image</div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{car.year} {car.make} {car.model}</CardTitle>
                    <CardDescription>{formatPrice(car.price)}</CardDescription>
                  </div>
                  {getStatusBadge(car)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mileage:</span>
                    <span>{car.mileage.toLocaleString()} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel:</span>
                    <span className="capitalize">{car.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transmission:</span>
                    <span className="capitalize">{car.transmission}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateCarStatus(car.id, !car.available)}
                    disabled={updateCarMutation.isPending}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {car.available ? "Mark Sold" : "Mark Available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCars.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No cars found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}