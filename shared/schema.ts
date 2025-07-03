import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, dealer, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealers = pgTable("dealers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  verified: boolean("verified").default(false),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(), // gasoline, electric, hybrid, diesel
  transmission: text("transmission").notNull(), // automatic, manual, cvt
  bodyType: text("body_type").notNull(), // sedan, suv, hatchback, convertible, pickup, coupe
  drivetrain: text("drivetrain").notNull(), // fwd, rwd, awd, 4wd
  engine: text("engine"),
  horsepower: integer("horsepower"),
  mpgCity: integer("mpg_city"),
  mpgHighway: integer("mpg_highway"),
  safetyRating: integer("safety_rating"), // 1-5 stars
  color: text("color"),
  vin: text("vin"),
  condition: text("condition").default("used"), // new, used, certified
  features: text("features").array(),
  imageUrls: text("image_urls").array(),
  description: text("description"),
  dealerId: integer("dealer_id").references(() => dealers.id),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  dealerId: integer("dealer_id").references(() => dealers.id),
  carId: integer("car_id").references(() => cars.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoriteCars = pgTable("favorite_cars", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertDealerSchema = createInsertSchema(dealers).omit({
  id: true,
  createdAt: true,
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteCarSchema = createInsertSchema(favoriteCars).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type FavoriteCar = typeof favoriteCars.$inferSelect;
export type InsertFavoriteCar = z.infer<typeof insertFavoriteCarSchema>;
