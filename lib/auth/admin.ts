import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "neon_admin_session";

export function getSessionSignature() {
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me";
  const secret = process.env.AUTH_SECRET || "replace-with-a-long-random-string";

  return createHash("sha256").update(`${secret}:${adminPassword}`).digest("hex");
}

export function hasAdminSessionValue(value?: string) {
  return value === getSessionSignature();
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return hasAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me";

  if (password !== adminPassword) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getSessionSignature(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
