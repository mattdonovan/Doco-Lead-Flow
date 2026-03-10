import { users, quoteRequests, type User, type InsertUser, type QuoteRequest, type InsertQuoteRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: string): Promise<QuoteRequest | undefined>;
  updateQuoteDetails(id: string, data: { serviceDetails?: unknown; homeContext?: string[]; photoUrl?: string; selectedOfferings?: string[]; additionalDetails?: string }): Promise<QuoteRequest | undefined>;
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

  async getQuoteRequest(id: string): Promise<QuoteRequest | undefined> {
    const [quote] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quote || undefined;
  }

  async updateQuoteDetails(id: string, data: { serviceDetails?: unknown; homeContext?: string[]; photoUrl?: string; selectedOfferings?: string[]; additionalDetails?: string }): Promise<QuoteRequest | undefined> {
    const updateData: Record<string, unknown> = {};
    if (data.serviceDetails !== undefined) updateData.serviceDetails = data.serviceDetails;
    if (data.homeContext !== undefined) updateData.homeContext = data.homeContext;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.selectedOfferings !== undefined) updateData.selectedOfferings = data.selectedOfferings;
    if (data.additionalDetails !== undefined) updateData.additionalDetails = data.additionalDetails;

    const [quote] = await db.update(quoteRequests).set(updateData).where(eq(quoteRequests.id, id)).returning();
    return quote || undefined;
  }
}

export const storage = new DatabaseStorage();
