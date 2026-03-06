import { users, quoteRequests, type User, type InsertUser, type QuoteRequest, type InsertQuoteRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quote] = await db.insert(quoteRequests).values(data).returning();
    return quote;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests);
  }
}

export const storage = new DatabaseStorage();
