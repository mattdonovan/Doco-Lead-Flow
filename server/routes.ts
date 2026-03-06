import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/quotes", async (req, res) => {
    try {
      const parsed = insertQuoteRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error.flatten() });
      }
      const quote = await storage.createQuoteRequest(parsed.data);
      return res.status(201).json(quote);
    } catch (error) {
      console.error("Error creating quote request:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quotes", async (_req, res) => {
    try {
      const quotes = await storage.getQuoteRequests();
      return res.json(quotes);
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
