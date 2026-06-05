"use server";

import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { client } from "@/lib/db";
import { validateEmail, validateName } from "@/lib/validation";
import { sendConfirmationEmail } from "@/lib/email";
import { GroupConfig } from "@/data/flowers";

export async function submitRsvp(data: { name: string; email: string }): Promise<{ success: boolean; error?: string }> {
  const nameResult = validateName(data.name);
  if (!nameResult.valid) {
    return { success: false, error: nameResult.error };
  }

  const emailResult = await validateEmail(data.email);
  if (!emailResult.valid) {
    return { success: false, error: emailResult.error };
  }

  try {
    await client.execute({
      sql: "INSERT INTO rsvps (name, email) VALUES (?, ?)",
      args: [data.name.trim(), data.email.trim()],
    });

    const emailResp = await sendConfirmationEmail(data.name.trim(), data.email.trim());
    if (!emailResp.success) {
      console.error("Failed to send confirmation email:", emailResp.error);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to submit RSVP:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function saveFlowersAction(data: GroupConfig[]) {
  const filePath = path.join(process.cwd(), "src/data/flowers.ts");

  const normalized = data.map((g) => ({
    ...g,
    flowers: g.flowers.map((f) => ({ ...f, zIndex: f.zIndex ?? 10 })),
  }));

  const fileContent = `export const REF_W = 1920;
export const REF_H = 1080;

export interface FlowerConfig {
  path: string;
  origin: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  zIndex?: number;
}

export interface GroupConfig {
  anchorX: number;
  anchorY: number;
  flowers: FlowerConfig[];
}

export function originTranslate(origin: string) {
  const parts = origin.toLowerCase().split(/\\s+/);
  let tx = -50, ty = -50;
  if (parts.includes("left")) tx = 0;
  else if (parts.includes("right")) tx = -100;
  if (parts.includes("top")) ty = 0;
  else if (parts.includes("bottom")) ty = -100;
  return { tx, ty };
}

export const groups: GroupConfig[] = ${JSON.stringify(normalized, null, 2)};
`;

  try {
    fs.writeFileSync(filePath, fileContent);
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to save design configuration" };
  }
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_authed")?.value === "true";
}

export async function adminLogin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_authed", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 4,
    path: "/admin",
  });

  return true;
}

export async function getRsvps(): Promise<{ name: string; email: string; createdAt: Date }[]> {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_authed");

  if (!authed || authed.value !== "true") {
    throw new Error("Unauthorized");
  }

  const result = await client.execute("SELECT name, email, created_at FROM rsvps ORDER BY created_at DESC");
  return result.rows.map((r) => ({
    name: r.name as string,
    email: r.email as string,
    createdAt: new Date(r.created_at as string),
  }));
}
