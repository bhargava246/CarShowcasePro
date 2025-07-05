import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Shield, 
  Car as CarIcon, 
  Users, 
  MessageCircle,
  Heart,
  Calendar,
  Award,
  TrendingUp,
  Clock
} from "lucide-react";
import { type Dealer, type Car, type Review } from "@shared/schema";
import { Link } from "wouter";

export default function DealerProfile() {
  const { id } = useParams<{ id: string }>();
  
  const { data: dealer, isLoading: dealerLoading } = useQuery<Dealer>({
    queryKey: ['/api/dealers', id],
    enabled: !!id,
  });

  const { data: dealerCars, isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: [`/api/dealers/${id}/cars`],
    enabled: !!id,
  });

  const { data: dealerReviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/reviews/dealer/${id}`],
    enabled: !!id,
  });

  if (dealerLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dealer Not Found</h1>
          <p className="text-gray-600 mb-4">The dealer you're looking for doesn't exist.</p>
          <Link href="/dealers">
            <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark">
              Browse All Dealers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalInventory = dealerCars?.length || 0;
  const averagePrice = dealerCars?.length 
    ? dealerCars.reduce((sum, car) => sum + parseFloat(car.price), 0) / dealerCars.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-carstore-orange to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Avatar className="h-20 w-20 mr-4">
                  <AvatarImage src={dealer.imageUrl || ""} alt={dealer.name} />
                  <AvatarFallback className="bg-white text-carstore-orange text-2xl font-bold">
                    {dealer.name ? dealer.name.substring(0, 2).toUpperCase() : "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{dealer.name}</h1>
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-orange-100">{dealer.location}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="flex text-yellow-300">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(parseFloat(dealer.rating || "0")) ? "fill-current" : ""
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-orange-100">
                        {dealer.rating} ({dealer.reviewCount} reviews)
                      </span>
                    </div>
                    {dealer.verified && (
                      <Badge className="bg-green-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Dealer
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <CarIcon className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-2xl font-bold text-white">{totalInventory}</div>
                  <div className="text-orange-100 text-sm">Cars Available</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-white" />
                  <div className="text-2xl font-bold text-white">
                    ${averagePrice.toLocaleString()}
                  </div>
                  <div className="text-orange-100 text-sm">Avg. Price</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inventory" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Available Cars</h2>
                  <div className="text-sm text-gray-600">
                    {totalInventory} cars available
                  </div>
                </div>
                
                {carsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : dealerCars?.length === 0 ? (
                  <div className="text-center py-12">
                    <CarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cars Available</h3>
                    <p className="text-gray-600">This dealer currently has no cars in inventory.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dealerCars?.map((car) => (
                      <Card key={car.id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <img 
                            src={car.imageUrls?.[0] || "/placeholder-car.jpg"} 
                            alt={`${car.year} ${car.make} ${car.model}`}
                            className="w-full h-48 object-cover rounded-lg mb-4" 
                          />
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {car.year} {car.make} {car.model}
                                </h3>
                                <p className="text-sm text-gray-600">{car.mileage.toLocaleString()} miles</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-carstore-orange">
                                  ${parseFloat(car.price).toLocaleString()}
                                </div>
                                <Badge variant="secondary" className="mt-1">
                                  {car.condition}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <span className="mr-1">🚗</span>
                                {car.bodyType}
                              </span>
                              <span className="flex items-center">
                                <span className="mr-1">⛽</span>
                                {car.fuelType}
                              </span>
                              <span className="flex items-center">
                                <span className="mr-1">⚙️</span>
                                {car.transmission}
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Link href={`/cars/${car.id}`} className="flex-1">
                                <Button className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark">
                                  View Details
                                </Button>
                              </Link>
                              <Button variant="outline" size="icon">
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  <div className="text-sm text-gray-600">
                    {dealer.reviewCount} reviews
                  </div>
                </div>
                
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : dealerReviews?.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600">Be the first to leave a review for this dealer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dealerReviews?.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex text-yellow-400">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < (review.rating || 0) ? "fill-current" : ""
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="about" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About {dealer.name}</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {dealer.description || `${dealer.name} is a trusted automotive dealer serving the ${dealer.location} area. We specialize in providing quality vehicles with excellent customer service and competitive pricing.`}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-carstore-orange" />
                      <span className="text-gray-700">Quality Certified Vehicles</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-carstore-orange" />
                      <span className="text-gray-700">Verified Dealer Status</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-carstore-orange" />
                      <span className="text-gray-700">Quick Response Time</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-carstore-orange" />
                      <span className="text-gray-700">Excellent Customer Service</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-carstore-orange" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dealer.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{dealer.phone}</p>
                    </div>
                  </div>
                )}
                
                {dealer.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{dealer.email}</p>
                    </div>
                  </div>
                )}
                
                {dealer.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold">{dealer.address}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Dealer
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Inventory</span>
                  <span className="font-semibold">{totalInventory}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold">{dealer.rating}/5.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold">{dealer.reviewCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verified Status</span>
                  <Badge className={dealer.verified ? "bg-green-500" : "bg-gray-500"}>
                    {dealer.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}