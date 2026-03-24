import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteRequestSchema } from "@shared/schema";
import { SERVICE_AREA, SURROUNDING_AREA } from "@shared/cities";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const notifySchema = z.object({
  email: z.string().email(),
  city: z.string().min(1).max(100),
});

async function sendQuoteEmail(quote: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city: string;
  services: string[];
  propertyType: string;
  projectTimeline: string;
  additionalDetails?: string | null;
  hasInsuranceClaim?: boolean | null;
  selectedOfferings?: string[] | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — skipping email notification");
    return;
  }

  const fn = escapeHtml(quote.firstName);
  const ln = escapeHtml(quote.lastName);
  const em = escapeHtml(quote.email);
  const ph = quote.phone ? escapeHtml(quote.phone) : "";
  const ct = escapeHtml(quote.city);
  const svcs = quote.services.map(escapeHtml).join(", ");
  const pt = escapeHtml(quote.propertyType);
  const tl = escapeHtml(quote.projectTimeline);
  const ad = quote.additionalDetails ? escapeHtml(quote.additionalDetails) : "";
  const offerings = quote.selectedOfferings && quote.selectedOfferings.length > 0
    ? quote.selectedOfferings.map(escapeHtml).join(", ")
    : "";

  const offeringsHtml = offerings
    ? `<tr><td style="padding: 8px 0; color: #666; width: 140px;">Specific Needs:</td><td style="padding: 8px 0;">${offerings}</td></tr>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #58E3EA; margin: 0; font-size: 24px;">New Estimate Request</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px;">
        <h2 style="color: #333; margin-top: 0;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${fn} ${ln}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${em}">${em}</a></td></tr>
          ${ph ? `<tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${ph}">${ph}</a></td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #666;">City:</td><td style="padding: 8px 0;">${ct}</td></tr>
        </table>

        <h2 style="color: #333; margin-top: 24px;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Services:</td><td style="padding: 8px 0; font-weight: bold;">${svcs}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Property Type:</td><td style="padding: 8px 0;">${pt}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Timeline:</td><td style="padding: 8px 0;">${tl}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Insurance Claim:</td><td style="padding: 8px 0;">${quote.hasInsuranceClaim ? "Yes" : "No"}</td></tr>
          ${offeringsHtml}
        </table>

        ${ad ? `
          <h2 style="color: #333; margin-top: 24px;">Additional Details</h2>
          <p style="color: #555; line-height: 1.6;">${ad}</p>
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

async function sendNotifyEmail(email: string, city: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — skipping notification email");
    return;
  }

  const safeEmail = escapeHtml(email);
  const safeCity = escapeHtml(city);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #58E3EA; margin: 0; font-size: 24px;">Expansion Interest</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px;">
        <p style="color: #333; font-size: 16px; margin-top: 0;">Someone wants to be notified when you expand to their area:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 100px;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">City:</td><td style="padding: 8px 0; font-weight: bold;">${safeCity}, MN</td></tr>
        </table>
      </div>
      <div style="background: #0A0A0A; padding: 16px; text-align: center;">
        <p style="color: #666; margin: 0; font-size: 12px;">DOCO Exteriors — Expansion Notification</p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "DOCO Exteriors <onboarding@resend.dev>",
    to: "iam.mattdonovan@gmail.com",
    replyTo: email,
    subject: `Expansion Interest: ${safeCity}, MN — ${safeEmail}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

const updateDetailsSchema = z.object({
  serviceDetails: z.record(z.record(z.union([z.string(), z.array(z.string())]))).optional(),
  homeContext: z.array(z.string()).optional(),
  photoUrl: z.string().optional(),
  selectedOfferings: z.array(z.string()).optional(),
  additionalDetails: z.string().optional(),
});

async function sendDetailUpdateEmail(quote: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  city: string;
  services: string[];
  propertyType: string;
  projectTimeline: string;
  hasInsuranceClaim?: boolean | null;
  serviceDetails?: unknown;
  homeContext?: string[] | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — skipping detail update email");
    return;
  }

  const fn = escapeHtml(quote.firstName);
  const ln = escapeHtml(quote.lastName);
  const em = escapeHtml(quote.email);
  const ct = escapeHtml(quote.city);
  const svcs = quote.services.map(escapeHtml).join(", ");

  let serviceDetailsHtml = "";
  if (quote.serviceDetails && typeof quote.serviceDetails === "object") {
    const details = quote.serviceDetails as Record<string, Record<string, string>>;
    for (const [service, answers] of Object.entries(details)) {
      serviceDetailsHtml += `<h3 style="color: #58E3EA; margin-top: 16px; font-size: 14px; text-transform: uppercase;">${escapeHtml(service)}</h3><table style="width: 100%; border-collapse: collapse;">`;
      for (const [question, answer] of Object.entries(answers)) {
        serviceDetailsHtml += `<tr><td style="padding: 6px 0; color: #666; width: 50%;">${escapeHtml(question)}</td><td style="padding: 6px 0;">${escapeHtml(answer)}</td></tr>`;
      }
      serviceDetailsHtml += `</table>`;
    }
  }

  let contextHtml = "";
  if (quote.homeContext && quote.homeContext.length > 0) {
    contextHtml = `<h3 style="color: #333; margin-top: 16px;">Home & Project Context</h3><p style="color: #555;">${quote.homeContext.map(escapeHtml).join(", ")}</p>`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #58E3EA; margin: 0; font-size: 24px;">Additional Details Submitted</h1>
        <p style="color: #888; margin: 8px 0 0; font-size: 14px;">${fn} ${ln} added more information to their estimate request</p>
      </div>
      <div style="background: #f9f9f9; padding: 24px;">
        <h2 style="color: #333; margin-top: 0;">Lead Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${fn} ${ln}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${em}">${em}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">City:</td><td style="padding: 8px 0;">${ct}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Services:</td><td style="padding: 8px 0;">${svcs}</td></tr>
        </table>

        ${serviceDetailsHtml ? `<h2 style="color: #333; margin-top: 24px;">Service-Specific Answers</h2>${serviceDetailsHtml}` : ""}
        ${contextHtml}
      </div>
      <div style="background: #0A0A0A; padding: 16px; text-align: center;">
        <p style="color: #666; margin: 0; font-size: 12px;">DOCO Exteriors — Lead Detail Update</p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "DOCO Exteriors <onboarding@resend.dev>",
    to: "iam.mattdonovan@gmail.com",
    replyTo: quote.email,
    subject: `Lead Update: ${fn} ${ln} — Additional Details`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #58E3EA; margin: 0; font-size: 24px;">Thanks for the Extra Details!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px;">
        <p style="color: #333; font-size: 16px; margin-top: 0;">Hi ${fn},</p>
        <p style="color: #555; line-height: 1.6;">Thanks for taking the time to share more about your project. This information helps us prepare for your estimate visit so we can make the most of our time together.</p>
        <p style="color: #555; line-height: 1.6;">Our team will be in touch within one business day.</p>
        <p style="color: #555; line-height: 1.6;">— The DOCO Exteriors Team</p>
      </div>
      <div style="background: #0A0A0A; padding: 16px; text-align: center;">
        <p style="color: #666; margin: 0; font-size: 12px;">DOCO Exteriors — Minneapolis, MN</p>
      </div>
    </div>
  `;

  const { error: userError } = await resend.emails.send({
    from: "DOCO Exteriors <onboarding@resend.dev>",
    to: quote.email,
    subject: `DOCO Exteriors — We Got Your Details`,
    html: userHtml,
  });

  if (userError) {
    console.error("Failed to send user copy email:", userError);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/info", (_req, res) => {
    res.json({
      name: "DOCO Exteriors",
      tagline: "Protecting Homes, Exceeding Expectations",
      services: ["Roofing", "Siding", "Windows", "Gutters"],
      serviceArea: SERVICE_AREA,
      estimateFormUrl: "https://docoexteriors.com/estimate",
      contact: { email: "iam.mattdonovan@gmail.com" },
    });
  });

  app.get("/api/service-area", (_req, res) => {
    res.json({ servicedCities: SERVICE_AREA, expandingSoon: SURROUNDING_AREA });
  });

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

  app.patch("/api/quotes/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = updateDetailsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error.flatten() });
      }

      const existing = await storage.getQuoteRequest(id);
      if (!existing) {
        return res.status(404).json({ error: "Quote request not found" });
      }

      const updated = await storage.updateQuoteDetails(id, parsed.data);

      try {
        await sendDetailUpdateEmail({
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          phone: existing.phone,
          city: existing.city,
          services: existing.services,
          propertyType: existing.propertyType,
          projectTimeline: existing.projectTimeline,
          hasInsuranceClaim: existing.hasInsuranceClaim,
          serviceDetails: parsed.data.serviceDetails,
          homeContext: parsed.data.homeContext,
        });
      } catch (emailError) {
        console.error("Failed to send detail update email:", emailError);
      }

      return res.json(updated);
    } catch (error) {
      console.error("Error updating quote details:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/notify", async (req, res) => {
    try {
      const parsed = notifySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request data", details: parsed.error.flatten() });
      }
      const { email, city } = parsed.data;

      try {
        await sendNotifyEmail(email, city);
      } catch (emailError) {
        console.error("Failed to send notify email:", emailError);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing notification:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
