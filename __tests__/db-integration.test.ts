import { describe, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import dns from "dns";

// Set DNS servers to a public reliable one to bypass link-local IPv6 DNS resolution issues in Node
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load env variables manually from .env.local before any other imports
try {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const part = line.trim();
      if (part && !part.startsWith("#")) {
        const equalIdx = part.indexOf("=");
        if (equalIdx > -1) {
          const key = part.slice(0, equalIdx).trim();
          const val = part.slice(equalIdx + 1).trim();
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.error("Failed to load .env.local:", e);
}

describe("MongoDB Integration Test", () => {
  it("should connect and save a document or throw the exact error", async () => {
    console.log("Using MONGODB_URI:", process.env.MONGODB_URI ? "Loaded (masked)" : "Not Loaded");

    // Dynamic imports to ensure process.env.MONGODB_URI is populated first
    const mongoose = await import("mongoose");
    const { connectToDatabase } = await import("../src/lib/mongodb");
    const { Rsvp } = await import("../src/models/rsvp");

    try {
      console.log("Connecting to database...");
      await connectToDatabase();
      console.log("Connected successfully!");

      console.log("Attempting to save a test RSVP...");
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const testRsvp = await Rsvp.create({
        name: "Test User",
        email: uniqueEmail,
      });

      console.log("Saved successfully! Document:", testRsvp);

      // Clean up the test document
      await Rsvp.deleteOne({ _id: testRsvp._id });
      console.log("Cleaned up test document.");
    } catch (error) {
      console.error("DATABASE ERROR ENCOUNTERED:", error);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log("Disconnected from database.");
    }
  }, 30000); // 30s timeout
});
