import { ObjectId } from 'mongodb';
import { database } from './db';
import type { 
  User, InsertUser, Dealer, InsertDealer, Car, InsertCar, 
  Review, InsertReview, FavoriteCar, InsertFavoriteCar,
  InventoryLog, InsertInventoryLog, Sale, InsertSale,
  DealerAnalytics, InsertDealerAnalytics, CarSearchFilters,
  convertGoogleDriveUrl, calculateCarPrice
} from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dealer operations
  getDealer(id: string): Promise<Dealer | undefined>;
  getAllDealers(): Promise<Dealer[]>;
  getDealersByLocation(location: string): Promise<Dealer[]>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  updateDealerRating(id: string, rating: number, reviewCount: number): Promise<void>;
  
  // Car operations
  getCar(id: string): Promise<Car | undefined>;
  getAllCars(): Promise<Car[]>;
  getCarsByDealer(dealerId: string): Promise<Car[]>;
  searchCars(filters: CarSearchFilters): Promise<{ cars: Car[]; total: number }>;
  getFeaturedCars(): Promise<Car[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: string, updates: Partial<InsertCar>): Promise<Car | undefined>;
  
  // Review operations
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByDealer(dealerId: string): Promise<Review[]>;
  getReviewsByCar(carId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Favorite operations
  getUserFavorites(userId: string): Promise<FavoriteCar[]>;
  addToFavorites(favorite: InsertFavoriteCar): Promise<FavoriteCar>;
  removeFromFavorites(userId: string, carId: string): Promise<void>;
  
  // Inventory Management operations
  createInventoryLog(log: InsertInventoryLog): Promise<InventoryLog>;
  getInventoryLogs(dealerId: string): Promise<InventoryLog[]>;
  
  // Sales operations
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDealer(dealerId: string): Promise<Sale[]>;
  updateSale(id: string, updates: Partial<InsertSale>): Promise<Sale | undefined>;
  
  // Analytics operations
  createDealerAnalytics(analytics: InsertDealerAnalytics): Promise<DealerAnalytics>;
  getDealerAnalytics(dealerId: string, period: string): Promise<DealerAnalytics[]>;
}

export class MongoDBStorage implements IStorage {
  private async getCollection<T>(name: string) {
    const db = database.getDb();
    return db.collection<T>(name);
  }

  // Helper to convert MongoDB _id to string and remove _id from response
  private formatDocument<T extends { _id?: string }>(doc: any): T {
    if (!doc) return doc;
    if (doc._id && typeof doc._id === 'object') {
      doc._id = doc._id.toString();
    }
    return doc;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const collection = await this.getCollection<User>('users');
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return this.formatDocument(user);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const collection = await this.getCollection<User>('users');
    const user = await collection.findOne({ username });
    return this.formatDocument(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const collection = await this.getCollection<User>('users');
    const user = await collection.findOne({ email });
    return this.formatDocument(user);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const collection = await this.getCollection<User>('users');
    const user = {
      ...userData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(user);
    return this.formatDocument({ ...user, _id: result.insertedId.toString() });
  }

  // Dealer operations
  async getDealer(id: string): Promise<Dealer | undefined> {
    const collection = await this.getCollection<Dealer>('dealers');
    const dealer = await collection.findOne({ _id: new ObjectId(id) });
    return this.formatDocument(dealer);
  }

  async getAllDealers(): Promise<Dealer[]> {
    const collection = await this.getCollection<Dealer>('dealers');
    const dealers = await collection.find({}).toArray();
    return dealers.map(dealer => this.formatDocument(dealer));
  }

  async getDealersByLocation(location: string): Promise<Dealer[]> {
    const collection = await this.getCollection<Dealer>('dealers');
    const dealers = await collection.find({ 
      location: { $regex: location, $options: 'i' } 
    }).toArray();
    return dealers.map(dealer => this.formatDocument(dealer));
  }

  async createDealer(dealerData: InsertDealer): Promise<Dealer> {
    const collection = await this.getCollection<Dealer>('dealers');
    const dealer = {
      ...dealerData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(dealer);
    return this.formatDocument({ ...dealer, _id: result.insertedId.toString() });
  }

  async updateDealerRating(id: string, rating: number, reviewCount: number): Promise<void> {
    const collection = await this.getCollection<Dealer>('dealers');
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { rating, reviewCount } }
    );
  }

  // Car operations with enhanced features
  async getCar(id: string): Promise<Car | undefined> {
    const collection = await this.getCollection<Car>('cars');
    const car = await collection.findOne({ _id: new ObjectId(id) });
    const formattedCar = this.formatDocument(car);
    
    if (formattedCar) {
      // Convert Google Drive URLs to direct links
      if (formattedCar.googleDriveImages) {
        formattedCar.googleDriveImages = formattedCar.googleDriveImages.map(convertGoogleDriveUrl);
      }
    }
    
    return formattedCar;
  }

  async getAllCars(): Promise<Car[]> {
    const collection = await this.getCollection<Car>('cars');
    const cars = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return cars.map(car => {
      const formattedCar = this.formatDocument(car);
      if (formattedCar.googleDriveImages) {
        formattedCar.googleDriveImages = formattedCar.googleDriveImages.map(convertGoogleDriveUrl);
      }
      return formattedCar;
    });
  }

  async getCarsByDealer(dealerId: string): Promise<Car[]> {
    const collection = await this.getCollection<Car>('cars');
    const cars = await collection.find({ dealerId }).sort({ createdAt: -1 }).toArray();
    return cars.map(car => {
      const formattedCar = this.formatDocument(car);
      if (formattedCar.googleDriveImages) {
        formattedCar.googleDriveImages = formattedCar.googleDriveImages.map(convertGoogleDriveUrl);
      }
      return formattedCar;
    });
  }

  async searchCars(filters: CarSearchFilters): Promise<{ cars: Car[]; total: number }> {
    const collection = await this.getCollection<Car>('cars');
    const query: any = {};

    // Build search query
    if (filters.make) query.make = { $regex: filters.make, $options: 'i' };
    if (filters.model) query.model = { $regex: filters.model, $options: 'i' };
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.minYear || filters.maxYear) {
      query.year = {};
      if (filters.minYear) query.year.$gte = filters.minYear;
      if (filters.maxYear) query.year.$lte = filters.maxYear;
    }
    if (filters.fuelType) query.fuelType = filters.fuelType;
    if (filters.transmission) query.transmission = filters.transmission;
    if (filters.bodyType) query.bodyType = filters.bodyType;
    if (filters.maxMileage) query.mileage = { $lte: filters.maxMileage };
    if (filters.condition) query.condition = filters.condition;
    if (filters.dealerId) query.dealerId = filters.dealerId;

    // Sort options
    let sort: any = {};
    switch (filters.sortBy) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'year_desc':
        sort.year = -1;
        break;
      case 'mileage_asc':
        sort.mileage = 1;
        break;
      default:
        sort.createdAt = -1;
    }

    const total = await collection.countDocuments(query);
    const cars = await collection
      .find(query)
      .sort(sort)
      .skip(filters.offset)
      .limit(filters.limit)
      .toArray();

    return {
      cars: cars.map(car => {
        const formattedCar = this.formatDocument(car);
        if (formattedCar.googleDriveImages) {
          formattedCar.googleDriveImages = formattedCar.googleDriveImages.map(convertGoogleDriveUrl);
        }
        return formattedCar;
      }),
      total
    };
  }

  async getFeaturedCars(): Promise<Car[]> {
    const collection = await this.getCollection<Car>('cars');
    const cars = await collection
      .find({ available: true, inventoryStatus: 'in_stock' })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();
    
    return cars.map(car => {
      const formattedCar = this.formatDocument(car);
      if (formattedCar.googleDriveImages) {
        formattedCar.googleDriveImages = formattedCar.googleDriveImages.map(convertGoogleDriveUrl);
      }
      return formattedCar;
    });
  }

  async createCar(carData: InsertCar): Promise<Car> {
    const collection = await this.getCollection<Car>('cars');
    
    // Calculate fair market price
    let calculatedPrice;
    try {
      const priceResult = calculateCarPrice({
        basePrice: carData.price,
        mileage: carData.mileage,
        year: carData.year,
        condition: carData.condition,
        features: carData.features || [],
        make: carData.make,
        model: carData.model,
      });
      calculatedPrice = priceResult.adjustedPrice;
    } catch (error) {
      calculatedPrice = carData.price; // Fallback to original price
    }

    const car = {
      ...carData,
      calculatedPrice,
      priceHistory: [{
        price: carData.price,
        date: new Date(),
        reason: 'Initial listing'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(car);
    const createdCar = this.formatDocument({ ...car, _id: result.insertedId.toString() });
    
    // Log inventory action
    await this.createInventoryLog({
      carId: createdCar._id!,
      dealerId: carData.dealerId,
      action: 'added',
      newStatus: carData.inventoryStatus || 'in_stock',
      notes: 'Car added to inventory',
      performedBy: carData.dealerId // Assuming dealer creates their own cars
    });
    
    return createdCar;
  }

  async updateCar(id: string, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const collection = await this.getCollection<Car>('cars');
    const currentCar = await this.getCar(id);
    
    if (!currentCar) return undefined;
    
    // Track price changes
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    if (updates.price && updates.price !== currentCar.price) {
      updateData.priceHistory = [
        ...(currentCar.priceHistory || []),
        {
          price: updates.price,
          date: new Date(),
          reason: 'Price updated'
        }
      ];
      
      // Log price change
      await this.createInventoryLog({
        carId: id,
        dealerId: currentCar.dealerId,
        action: 'price_changed',
        newStatus: currentCar.inventoryStatus,
        previousPrice: currentCar.price,
        newPrice: updates.price,
        notes: 'Price updated',
        performedBy: currentCar.dealerId
      });
    }
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return this.getCar(id);
  }

  // Review operations with enhanced features
  async getReview(id: string): Promise<Review | undefined> {
    const collection = await this.getCollection<Review>('reviews');
    const review = await collection.findOne({ _id: new ObjectId(id) });
    return this.formatDocument(review);
  }

  async getReviewsByDealer(dealerId: string): Promise<Review[]> {
    const collection = await this.getCollection<Review>('reviews');
    const reviews = await collection.find({ dealerId }).sort({ createdAt: -1 }).toArray();
    return reviews.map(review => this.formatDocument(review));
  }

  async getReviewsByCar(carId: string): Promise<Review[]> {
    const collection = await this.getCollection<Review>('reviews');
    const reviews = await collection.find({ carId }).sort({ createdAt: -1 }).toArray();
    return reviews.map(review => this.formatDocument(review));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const collection = await this.getCollection<Review>('reviews');
    const review = {
      ...reviewData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(review);
    
    // Update dealer rating if this is a dealer review
    if (reviewData.dealerId) {
      const dealerReviews = await this.getReviewsByDealer(reviewData.dealerId);
      const totalReviews = dealerReviews.length;
      const averageRating = dealerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      await this.updateDealerRating(reviewData.dealerId, averageRating, totalReviews);
    }
    
    return this.formatDocument({ ...review, _id: result.insertedId.toString() });
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<FavoriteCar[]> {
    const collection = await this.getCollection<FavoriteCar>('favorites');
    const favorites = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    return favorites.map(fav => this.formatDocument(fav));
  }

  async addToFavorites(favoriteData: InsertFavoriteCar): Promise<FavoriteCar> {
    const collection = await this.getCollection<FavoriteCar>('favorites');
    
    // Check if already exists
    const existing = await collection.findOne({ 
      userId: favoriteData.userId, 
      carId: favoriteData.carId 
    });
    
    if (existing) {
      return this.formatDocument(existing);
    }
    
    const favorite = {
      ...favoriteData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(favorite);
    return this.formatDocument({ ...favorite, _id: result.insertedId.toString() });
  }

  async removeFromFavorites(userId: string, carId: string): Promise<void> {
    const collection = await this.getCollection<FavoriteCar>('favorites');
    await collection.deleteOne({ userId, carId });
  }

  // Inventory management operations
  async createInventoryLog(logData: InsertInventoryLog): Promise<InventoryLog> {
    const collection = await this.getCollection<InventoryLog>('inventory_logs');
    const log = {
      ...logData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(log);
    return this.formatDocument({ ...log, _id: result.insertedId.toString() });
  }

  async getInventoryLogs(dealerId: string): Promise<InventoryLog[]> {
    const collection = await this.getCollection<InventoryLog>('inventory_logs');
    const logs = await collection.find({ dealerId }).sort({ createdAt: -1 }).toArray();
    return logs.map(log => this.formatDocument(log));
  }

  // Sales operations
  async createSale(saleData: InsertSale): Promise<Sale> {
    const collection = await this.getCollection<Sale>('sales');
    const sale = {
      ...saleData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(sale);
    
    // Update car status to sold
    await this.updateCar(saleData.carId, {
      inventoryStatus: 'sold',
      available: false,
      soldDate: new Date(),
      soldPrice: saleData.salePrice
    });
    
    // Log the sale
    await this.createInventoryLog({
      carId: saleData.carId,
      dealerId: saleData.dealerId,
      action: 'sold',
      previousStatus: 'in_stock',
      newStatus: 'sold',
      notes: `Sold to ${saleData.buyerName} for $${saleData.salePrice}`,
      performedBy: saleData.dealerId
    });
    
    return this.formatDocument({ ...sale, _id: result.insertedId.toString() });
  }

  async getSalesByDealer(dealerId: string): Promise<Sale[]> {
    const collection = await this.getCollection<Sale>('sales');
    const sales = await collection.find({ dealerId }).sort({ createdAt: -1 }).toArray();
    return sales.map(sale => this.formatDocument(sale));
  }

  async updateSale(id: string, updates: Partial<InsertSale>): Promise<Sale | undefined> {
    const collection = await this.getCollection<Sale>('sales');
    
    if (updates.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date();
    }
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    const sale = await collection.findOne({ _id: new ObjectId(id) });
    return this.formatDocument(sale);
  }

  // Analytics operations
  async createDealerAnalytics(analyticsData: InsertDealerAnalytics): Promise<DealerAnalytics> {
    const collection = await this.getCollection<DealerAnalytics>('dealer_analytics');
    const analytics = {
      ...analyticsData,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(analytics);
    return this.formatDocument({ ...analytics, _id: result.insertedId.toString() });
  }

  async getDealerAnalytics(dealerId: string, period: string): Promise<DealerAnalytics[]> {
    const collection = await this.getCollection<DealerAnalytics>('dealer_analytics');
    const analytics = await collection
      .find({ dealerId, period })
      .sort({ periodDate: -1 })
      .toArray();
    return analytics.map(item => this.formatDocument(item));
  }
}

// Initialize and seed the database
async function initializeDatabase() {
  const storage = new MongoDBStorage();
  
  // Check if we have any data, if not, seed it
  const existingCars = await storage.getAllCars();
  if (existingCars.length === 0) {
    console.log('🌱 Seeding database with initial data...');
    await seedDatabase(storage);
  }
}

async function seedDatabase(storage: MongoDBStorage) {
  try {
    // Create sample dealers
    const dealer1 = await storage.createDealer({
      name: "Premium Auto Group",
      location: "Downtown Los Angeles, CA",
      description: "Luxury vehicles and exceptional service since 1995",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      phone: "(555) 123-4567",
      email: "contact@premiumauto.com",
      address: "123 Luxury Ave, Los Angeles, CA 90210",
      rating: 4.8,
      reviewCount: 127,
      verified: true,
      businessHours: {
        monday: "9:00 AM - 7:00 PM",
        tuesday: "9:00 AM - 7:00 PM",
        wednesday: "9:00 AM - 7:00 PM",
        thursday: "9:00 AM - 7:00 PM",
        friday: "9:00 AM - 7:00 PM",
        saturday: "10:00 AM - 6:00 PM",
        sunday: "12:00 PM - 5:00 PM"
      },
      services: ["Financing", "Trade-ins", "Service & Maintenance", "Extended Warranties"]
    });

    const dealer2 = await storage.createDealer({
      name: "Elite Motors",
      location: "Beverly Hills, CA",
      description: "Your destination for exotic and luxury vehicles",
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
      phone: "(555) 987-6543",
      email: "info@elitemotors.com",
      address: "456 Rodeo Drive, Beverly Hills, CA 90210",
      rating: 4.9,
      reviewCount: 89,
      verified: true,
      businessHours: {
        monday: "10:00 AM - 8:00 PM",
        tuesday: "10:00 AM - 8:00 PM",
        wednesday: "10:00 AM - 8:00 PM",
        thursday: "10:00 AM - 8:00 PM",
        friday: "10:00 AM - 8:00 PM",
        saturday: "10:00 AM - 7:00 PM",
        sunday: "11:00 AM - 6:00 PM"
      },
      services: ["Concierge Service", "Custom Orders", "Collector Car Appraisals", "International Shipping"]
    });

    // Create sample cars with enhanced features
    const cars = [
      {
        make: "BMW",
        model: "3 Series",
        year: 2023,
        price: 45000,
        mileage: 12000,
        fuelType: "gasoline" as const,
        transmission: "automatic" as const,
        bodyType: "sedan" as const,
        drivetrain: "rwd" as const,
        engine: "2.0L Turbocharged I4",
        horsepower: 255,
        mpgCity: 26,
        mpgHighway: 36,
        safetyRating: 5,
        color: "Alpine White",
        vin: "WBA8E9C09NCP12345",
        condition: "used" as const,
        features: ["Navigation System", "Heated Seats", "Sunroof", "Premium Audio", "Backup Camera"],
        imageUrls: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
          "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
        ],
        googleDriveImages: [], // Users can add Google Drive links here
        description: "Immaculate BMW 3 Series with premium features and low mileage. One owner, full service history.",
        dealerId: dealer1._id!,
        available: true,
        inventoryStatus: "in_stock" as const,
        stockQuantity: 1
      },
      {
        make: "Tesla",
        model: "Model 3",
        year: 2022,
        price: 38000,
        mileage: 25000,
        fuelType: "electric" as const,
        transmission: "automatic" as const,
        bodyType: "sedan" as const,
        drivetrain: "rwd" as const,
        engine: "Electric Motor",
        horsepower: 283,
        mpgCity: 134,
        mpgHighway: 126,
        safetyRating: 5,
        color: "Pearl White",
        vin: "5YJ3E1EA9NF123789",
        condition: "used" as const,
        features: ["Autopilot", "Premium Interior", "Glass Roof", "Mobile Connector", "Supercharging"],
        imageUrls: [
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
        ],
        googleDriveImages: [],
        description: "Clean Tesla Model 3 with Autopilot and premium features. Excellent battery health.",
        dealerId: dealer2._id!,
        available: true,
        inventoryStatus: "in_stock" as const,
        stockQuantity: 1
      },
      {
        make: "Mercedes-Benz",
        model: "C-Class",
        year: 2022,
        price: 52000,
        mileage: 18000,
        fuelType: "gasoline" as const,
        transmission: "automatic" as const,
        bodyType: "sedan" as const,
        drivetrain: "rwd" as const,
        engine: "2.0L Turbocharged I4",
        horsepower: 255,
        mpgCity: 23,
        mpgHighway: 34,
        safetyRating: 5,
        color: "Obsidian Black",
        vin: "WDD2H8EB0NCF67890",
        condition: "certified" as const,
        features: ["MBUX Infotainment", "LED Headlights", "Wireless Charging", "Ambient Lighting", "Sport Package"],
        imageUrls: [
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
        ],
        googleDriveImages: [],
        description: "Certified Pre-Owned Mercedes-Benz C-Class with advanced technology and luxury appointments.",
        dealerId: dealer1._id!,
        available: true,
        inventoryStatus: "in_stock" as const,
        stockQuantity: 1
      }
    ];

    for (const carData of cars) {
      await storage.createCar(carData);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

export const storage = new MongoDBStorage();

// Initialize database on module import
initializeDatabase().catch(console.error);