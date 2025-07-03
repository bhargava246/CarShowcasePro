import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { Link } from "wouter";
import { formatPrice, formatMileage, capitalizeFirst } from "@/lib/utils";
import type { Car } from "@shared/schema";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const getBadgeVariant = (condition: string) => {
    switch (condition) {
      case "new": return "bg-purple-100 text-purple-800";
      case "certified": return "bg-green-100 text-green-800";
      case "used": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBadgeLabel = (condition: string) => {
    switch (condition) {
      case "new": return "New";
      case "certified": return "Certified";
      case "used": return "Popular";
      default: return capitalizeFirst(condition);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={car.imageUrls?.[0] || "/placeholder-car.jpg"} 
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-48 object-cover" 
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {car.year} {car.make} {car.model}
          </h3>
          <Badge className={getBadgeVariant(car.condition)}>
            {getBadgeLabel(car.condition)}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">
          {capitalizeFirst(car.bodyType)} • {formatMileage(car.mileage)} miles • {capitalizeFirst(car.transmission)} • {capitalizeFirst(car.drivetrain.toUpperCase())}
        </p>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < (car.safetyRating || 0) ? "fill-current" : ""
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm ml-2">
            {car.safetyRating || 0} (Safety Rating)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-carstore-orange">
            {formatPrice(car.price)}
          </span>
          <Link href={`/cars/${car.id}`}>
            <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark transition-colors">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
