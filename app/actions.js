"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyPassword } from "../lib/auth";
import { addToCart, removeFromCart, updateCartQuantity } from "../lib/cart";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeRedirectPath(path) {
  if (typeof path === "string" && /^\/(?!\/)/.test(path)) return path;
  return "/";
}

export async function registerAction(formData) {
  const name = formData.get("name")?.trim() || "";
  const email = formData.get("email")?.trim().toLowerCase() || "";
  const password = formData.get("password") || "";
  const confirm = formData.get("confirm") || "";

  if (!name || !email || !password) {
    redirect("/register?error=missing");
  }
  if (!EMAIL_RE.test(email)) {
    redirect("/register?error=email");
  }
  if (password.length < 6) {
    redirect("/register?error=short");
  }
  if (password !== confirm) {
    redirect("/register?error=match");
  }

  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    redirect("/register?error=taken");
  }

  const passwordHash = await hashPassword(password);
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  await createSession(result.insertId);
  redirect("/");
}

export async function loginAction(formData) {
  const email = formData.get("email")?.trim().toLowerCase() || "";
  const password = formData.get("password") || "";
  const next = safeRedirectPath(formData.get("next"));
  const nextParam = next !== "/" ? `&next=${encodeURIComponent(next)}` : "";

  if (!email || !password) {
    redirect(`/login?error=missing${nextParam}`);
  }

  const [rows] = await db.query(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email]
  );
  const user = rows[0];
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  if (!valid) {
    redirect(`/login?error=invalid${nextParam}`);
  }

  await createSession(user.id);
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function addToCartAction(formData) {
  const user = await getCurrentUser();
  const productId = Number(formData.get("productId"));
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  await addToCart(user.id, productId, 1);
  revalidatePath("/");
  revalidatePath("/cart");
  redirect(redirectTo);
}

export async function updateCartAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const productId = Number(formData.get("productId"));
  const quantity = Number(formData.get("quantity"));
  await updateCartQuantity(user.id, productId, quantity);
  revalidatePath("/cart");
  revalidatePath("/");
  redirect("/cart");
}

export async function removeFromCartAction(formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const productId = Number(formData.get("productId"));
  await removeFromCart(user.id, productId);
  revalidatePath("/cart");
  revalidatePath("/");
  redirect("/cart");
}
