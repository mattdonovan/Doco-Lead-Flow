import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema } from "@shared/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendQuoteEmail(quote: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  services: string[];
  propertyType: string;
  projectTimeline: string;
  additionalDetails?: string | null;
  hasInsuranceClaim?: boolean | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — skipping email notification");
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #58E3EA; margin: 0; font-size: 24px;">New Estimate Request</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px;">
        <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${quote.firstName} ${quote.lastName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${quote.email}">${quote.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${quote.phone}">${quote.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Address:</td><td style="padding: 8px 0;">${quote.address}, ${quote.city}</td></tr>
        </table>

        <h2 style="color: #333; margin-top: 24px;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Services:</td><td style="padding: 8px 0; font-weight: bold;">${quote.services.join(", ")}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Property Type:</td><td style="padding: 8px 0;">${quote.propertyType}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Timeline:</td><td style="padding: 8px 0;">${quote.projectTimeline}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Insurance Claim:</td><td style="padding: 8px 0;">${quote.hasInsuranceClaim ? "Yes" : "No"}</td></tr>
        </table>

        ${quote.additionalDetails ? `
          <h2 style="color: #333; margin-top: 24px;">Additional Details</h2>
          <p style="color: #555; line-height: 1.6;">${quote.additionalDetails}</p>
        ` : ""}
      </div>
      <div style="background: #0A0A0A; padding: 16px; text-align: center;">
        <p style="color: #666; margin: 0; font-size: 12px;">DOCO Exteriors — Estimate Request System</p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "DOCO Exteriors <onboarding@resend.dev>",
    to: "iam.mattdonovan@gmail.com",
    replyTo: quote.email,
    subject: `New Estimate Request: ${quote.firstName} ${quote.lastName} — ${quote.services.join(", ")}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

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

      try {
        await sendQuoteEmail(parsed.data);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }

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
