import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { getDb } from "@/db";
import { users, sessions } from "@/db/schema";

const SESSION_COOKIE = "session_token";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashStr: string): Promise<boolean> {
  return compare(password, hashStr);
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await getDb().insert(sessions).values({ id: token, userId, expiresAt });
  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token));

  const session = rows[0];
  if (!session || new Date(session.expiresAt) < new Date()) return null;

  return { id: session.id, email: session.email, name: session.name };
}

export async function registerUser(email: string, name: string, password: string) {
  const passwordHash = await hashPassword(password);
  const id = await getDb().insert(users).values({ email, name, passwordHash }).returning({ id: users.id });
  if (id.length === 0) throw new Error("Failed to create user");
  return { id: id[0].id, email, name };
}

export async function loginUser(email: string, password: string) {
  const rows = await getDb().select().from(users).where(eq(users.email, email));
  const user = rows[0];
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name };
}
