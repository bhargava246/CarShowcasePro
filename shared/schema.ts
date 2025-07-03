import { z } from "zod";

// MongoDB Schema Types

// User Schema
export const UserSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "dealer", "admin"]).default("user"),
  createdAt: z.date().default(() => new Date()),
});

export const insertUserSchema = UserSchema.omit({ _id: true, createdAt: true });
export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Dealer Schema
export const DealerSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  verified: z.boolean().default(false),
  userId: z.string().optional(),
  businessHours: z.object({
    monday: z.string().optional(),
    tuesday: z.string().optional(),
    wednesday: z.string().optional(),
    thursday: z.string().optional(),
    friday: z.string().optional(),
    saturday: z.string().optional(),
    sunday: z.string().optional(),
  }).optional(),
  services: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
});

export const insertDealerSchema = DealerSchema.omit({ _id: true, createdAt: true });
export type Dealer = z.infer<typeof DealerSchema>;
export type InsertDealer = z.infer<typeof insertDealerSchema>;

// Car Schema with Inventory Management
export const CarSchema = z.object({
  _id: z.string().optional(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0),
  mileage: z.number().min(0),
  fuelType: z.enum(["gasoline", "electric", "hybrid", "diesel"]),
  transmission: z.enum(["automatic", "manual", "cvt"]),
  bodyType: z.enum(["sedan", "suv", "hatchback", "convertible", "pickup", "coupe", "wagon", "minivan"]),
  drivetrain: z.enum(["fwd", "rwd", "awd", "4wd"]),
  engine: z.string().optional(),
  horsepower: z.number().min(0).optional(),
  mpgCity: z.number().min(0).optional(),
  mpgHighway: z.number().min(0).optional(),
  safetyRating: z.number().min(1).max(5).optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  condition: z.enum(["new", "used", "certified"]).default("used"),
  features: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).default([]),
  description: z.string().optional(),
  dealerId: z.string(),
  available: z.boolean().default(true),
  
  // Inventory Management Fields
  inventoryStatus: z.enum(["in_stock", "low_stock", "out_of_stock", "reserved", "sold"]).default("in_stock"),
  stockQuantity: z.number().min(0).default(1),
  reservedBy: z.string().optional(),
  reservedUntil: z.date().optional(),
  soldDate: z.date().optional(),
  soldPrice: z.number().min(0).optional(),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const insertCarSchema = CarSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type Car = z.infer<typeof CarSchema>;
export type InsertCar = z.infer<typeof insertCarSchema>;

// Review Schema
export const ReviewSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  dealerId: z.string().optional(),
  carId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  verified: z.boolean().default(false),
  helpful: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
});

export const insertReviewSchema = ReviewSchema.omit({ _id: true, createdAt: true });
export type Review = z.infer<typeof ReviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Favorite Cars Schema
export const FavoriteCarSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  carId: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export const insertFavoriteCarSchema = FavoriteCarSchema.omit({ _id: true, createdAt: true });
export type FavoriteCar = z.infer<typeof FavoriteCarSchema>;
export type InsertFavoriteCar = z.infer<typeof insertFavoriteCarSchema>;

// Inventory Management Schema
export const InventoryLogSchema = z.object({
  _id: z.string().optional(),
  carId: z.string(),
  dealerId: z.string(),
  action: z.enum(["added", "updated", "reserved", "sold", "returned", "removed"]),
  previousStatus: z.string().optional(),
  newStatus: z.string(),
  notes: z.string().optional(),
  performedBy: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export const insertInventoryLogSchema = InventoryLogSchema.omit({ _id: true, createdAt: true });
export type InventoryLog = z.infer<typeof InventoryLogSchema>;
export type InsertInventoryLog = z.infer<typeof insertInventoryLogSchema>;

// Sales Schema for Dealer Dashboard
export const SaleSchema = z.object({
  _id: z.string().optional(),
  carId: z.string(),
  dealerId: z.string(),
  buyerId: z.string().optional(),
  buyerName: z.string(),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().optional(),
  salePrice: z.number().min(0),
  commission: z.number().min(0).default(0),
  paymentMethod: z.enum(["cash", "financing", "lease", "trade_in", "other"]),
  status: z.enum(["pending", "completed", "cancelled", "refunded"]).default("pending"),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
});

export const insertSaleSchema = SaleSchema.omit({ _id: true, createdAt: true });
export type Sale = z.infer<typeof SaleSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;

// Dealer Analytics Schema
export const DealerAnalyticsSchema = z.object({
  _id: z.string().optional(),
  dealerId: z.string(),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  periodDate: z.date(),
  
  // Sales Metrics
  totalSales: z.number().default(0),
  totalRevenue: z.number().default(0),
  totalCommission: z.number().default(0),
  averageSalePrice: z.number().default(0),
  
  // Inventory Metrics
  totalInventory: z.number().default(0),
  availableInventory: z.number().default(0),
  soldInventory: z.number().default(0),
  
  // Performance Metrics
  viewCount: z.number().default(0),
  inquiryCount: z.number().default(0),
  testDriveCount: z.number().default(0),
  conversionRate: z.number().default(0),
  
  createdAt: z.date().default(() => new Date()),
});

export const insertDealerAnalyticsSchema = DealerAnalyticsSchema.omit({ _id: true, createdAt: true });
export type DealerAnalytics = z.infer<typeof DealerAnalyticsSchema>;
export type InsertDealerAnalytics = z.infer<typeof insertDealerAnalyticsSchema>;