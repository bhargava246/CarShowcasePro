import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCarSchema, insertDealerSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Car routes
  app.get("/api/cars", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/featured", async (req, res) => {
    try {
      const cars = await storage.getFeaturedCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured cars" });
    }
  });

  app.get("/api/cars/search", async (req, res) => {
    try {
      const filters = {
        make: req.query.make as string,
        model: req.query.model as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        fuelType: req.query.fuelType as string,
        transmission: req.query.transmission as string,
        bodyType: req.query.bodyType as string,
        maxMileage: req.query.maxMileage ? parseInt(req.query.maxMileage as string) : undefined,
      };

      // Remove undefined values and "all" values
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value === undefined || value === "" || value === "all") {
          delete filters[key as keyof typeof filters];
        }
      });

      const cars = await storage.searchCars(filters);
      res.json(cars);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCar(id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(carData);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid car data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  // Dealer routes
  app.get("/api/dealers", async (req, res) => {
    try {
      const dealers = await storage.getAllDealers();
      res.json(dealers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealers" });
    }
  });

  app.get("/api/dealers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dealer = await storage.getDealer(id);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer" });
    }
  });

  app.get("/api/dealers/:id/cars", async (req, res) => {
    try {
      const dealerId = parseInt(req.params.id);
      const cars = await storage.getCarsByDealer(dealerId);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer cars" });
    }
  });

  app.post("/api/dealers", async (req, res) => {
    try {
      const dealerData = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(dealerData);
      res.status(201).json(dealer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dealer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dealer" });
    }
  });

  // Review routes
  app.get("/api/reviews/dealer/:dealerId", async (req, res) => {
    try {
      const dealerId = parseInt(req.params.dealerId);
      const reviews = await storage.getReviewsByDealer(dealerId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer reviews" });
    }
  });

  app.get("/api/reviews/car/:carId", async (req, res) => {
    try {
      const carId = parseInt(req.params.carId);
      const reviews = await storage.getReviewsByCar(carId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = {
        userId: parseInt(req.body.userId),
        carId: parseInt(req.body.carId)
      };
      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:userId/:carId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const carId = parseInt(req.params.carId);
      await storage.removeFromFavorites(userId, carId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Utility routes
  app.get("/api/makes", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      const makes = Array.from(new Set(cars.map(car => car.make))).sort();
      res.json(makes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch makes" });
    }
  });

  app.get("/api/models/:make", async (req, res) => {
    try {
      const make = req.params.make;
      const cars = await storage.getAllCars();
      const models = Array.from(new Set(cars.filter(car => car.make === make).map(car => car.model))).sort();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
