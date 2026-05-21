"use server";

import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { Rsvp } from "@/models/rsvp";
import { validateEmail, validateName } from "@/lib/validation";
import { sendConfirmationEmail } from "@/lib/email";

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
    await connectToDatabase();
    await Rsvp.create({ name: data.name.trim(), email: data.email.trim() });

    const emailResult = await sendConfirmationEmail(data.name.trim(), data.email.trim());
    if (!emailResult.success) {
      console.error("Failed to send confirmation email:", emailResult.error);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
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

  await connectToDatabase();
  const rsvps = await Rsvp.find().sort({ createdAt: -1 });
  return rsvps.map((r) => ({
    name: r.name,
    email: r.email,
    createdAt: r.createdAt,
  }));
}
