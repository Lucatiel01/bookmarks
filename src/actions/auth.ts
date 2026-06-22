"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser, createSession, setSessionCookie, getCurrentUser, deleteSessionCookie } from "@/lib/auth";

export async function register(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!email || !name || !password || password.length < 6) {
    return { error: "Invalid input. Password must be at least 6 characters." };
  }

  try {
    const user = await registerUser(email, name, password);
    const token = await createSession(user.id);
    await setSessionCookie(token);
  } catch {
    return { error: "Email already in use." };
  }
  redirect("/");
}

export async function login(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await loginUser(email, password);
  if (!user) return { error: "Invalid email or password." };

  const token = await createSession(user.id);
  await setSessionCookie(token);
  redirect("/");
}

export async function logout() {
  await deleteSessionCookie();
  redirect("/login");
}

export async function checkAuth() {
  try {
    const user = await getCurrentUser();
    return user ? { id: user.id, email: user.email, name: user.name } : null;
  } catch {
    return null;
  }
}
