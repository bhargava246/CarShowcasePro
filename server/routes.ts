import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCarSchema, insertDealerSchema, insertReviewSchema, insertInventoryLogSchema, 
  insertSaleSchema, CarSearchSchema, PriceCalculatorSchema, calculateCarPrice, 
  convertGoogleDriveUrl 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Car routes with enhanced functionality
  app.get("/api/cars", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/featured", async (req, res) => {
    try {
      const cars = await storage.getFeaturedCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching featured cars:", error);
      res.status(500).json({ message: "Failed to fetch featured cars" });
    }
  });

  // Enhanced search with full filtering
  app.get("/api/cars/search", async (req, res) => {
    try {
      const filters = CarSearchSchema.parse({
        make: req.query.make,
        model: req.query.model,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        minYear: req.query.minYear ? Number(req.query.minYear) : undefined,
        maxYear: req.query.maxYear ? Number(req.query.maxYear) : undefined,
        fuelType: req.query.fuelType,
        transmission: req.query.transmission,
        bodyType: req.query.bodyType,
        maxMileage: req.query.maxMileage ? Number(req.query.maxMileage) : undefined,
        condition: req.query.condition,
        dealerId: req.query.dealerId,
        sortBy: req.query.sortBy || "created_desc",
        limit: req.query.limit ? Number(req.query.limit) : 20,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      });

      const result = await storage.searchCars(filters);
      res.json(result);
    } catch (error) {
      console.error("Error searching cars:", error);
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const car = await storage.getCar(req.params.id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  // Create car with Google Drive image support
  app.post("/api/cars", async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      
      // Convert Google Drive URLs if provided
      if (carData.googleDriveImages && carData.googleDriveImages.length > 0) {
        carData.googleDriveImages = carData.googleDriveImages.map(convertGoogleDriveUrl);
      }
      
      const car = await storage.createCar(carData);
      res.status(201).json(car);
    } catch (error) {
      console.error("Error creating car:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid car data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  // Update car with inventory management
  app.patch("/api/cars/:id", async (req, res) => {
    try {
      const updates = req.body;
      
      // Convert Google Drive URLs if provided in updates
      if (updates.googleDriveImages && updates.googleDriveImages.length > 0) {
        updates.googleDriveImages = updates.googleDriveImages.map(convertGoogleDriveUrl);
      }
      
      const car = await storage.updateCar(req.params.id, updates);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ message: "Failed to update car" });
    }
  });

  // Price calculator endpoint
  app.post("/api/cars/calculate-price", async (req, res) => {
    try {
      const input = PriceCalculatorSchema.parse(req.body);
      const priceResult = calculateCarPrice(input);
      res.json(priceResult);
    } catch (error) {
      console.error("Error calculating price:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid price calculation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to calculate price" });
    }
  });

  // Dealer routes
  app.get("/api/dealers", async (req, res) => {
    try {
      const dealers = await storage.getAllDealers();
      res.json(dealers);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      res.status(500).json({ message: "Failed to fetch dealers" });
    }
  });

  app.get("/api/dealers/:id", async (req, res) => {
    try {
      const dealer = await storage.getDealer(req.params.id);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      console.error("Error fetching dealer:", error);
      res.status(500).json({ message: "Failed to fetch dealer" });
    }
  });

  app.get("/api/dealers/:id/cars", async (req, res) => {
    try {
      const cars = await storage.getCarsByDealer(req.params.id);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching dealer cars:", error);
      res.status(500).json({ message: "Failed to fetch dealer cars" });
    }
  });

  app.post("/api/dealers", async (req, res) => {
    try {
      const dealerData = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(dealerData);
      res.status(201).json(dealer);
    } catch (error) {
      console.error("Error creating dealer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dealer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dealer" });
    }
  });

  // Enhanced Review routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { dealerId, carId } = req.query;
      let reviews;
      
      if (dealerId) {
        reviews = await storage.getReviewsByDealer(dealerId as string);
      } else if (carId) {
        reviews = await storage.getReviewsByCar(carId as string);
      } else {
        return res.status(400).json({ message: "dealerId or carId is required" });
      }
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Inventory Management routes
  app.get("/api/inventory/logs/:dealerId", async (req, res) => {
    try {
      const logs = await storage.getInventoryLogs(req.params.dealerId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
      res.status(500).json({ message: "Failed to fetch inventory logs" });
    }
  });

  app.post("/api/inventory/logs", async (req, res) => {
    try {
      const logData = insertInventoryLogSchema.parse(req.body);
      const log = await storage.createInventoryLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating inventory log:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory log" });
    }
  });

  // Sales Management routes
  app.get("/api/sales/:dealerId", async (req, res) => {
    try {
      const sales = await storage.getSalesByDealer(req.params.dealerId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.patch("/api/sales/:id", async (req, res) => {
    try {
      const updates = req.body;
      const sale = await storage.updateSale(req.params.id, updates);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:dealerId", async (req, res) => {
    try {
      const { period = "monthly" } = req.query;
      const analytics = await storage.getDealerAnalytics(req.params.dealerId, period as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.params.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, carId } = req.body;
      const favorite = await storage.addToFavorites({ userId, carId });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:userId/:carId", async (req, res) => {
    try {
      await storage.removeFromFavorites(req.params.userId, req.params.carId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Google Drive image conversion utility endpoint
  app.post("/api/utils/convert-google-drive-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      
      const convertedUrl = convertGoogleDriveUrl(url);
      res.json({ originalUrl: url, convertedUrl });
    } catch (error) {
      console.error("Error converting Google Drive URL:", error);
      res.status(500).json({ message: "Failed to convert URL" });
    }
  });

  const server = createServer(app);
  return server;
}