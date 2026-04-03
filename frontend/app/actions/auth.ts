"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { clearSession, createSession } from "@/lib/auth";
import { authenticateUser, registerUser } from "@/lib/data";
import { AuthActionState } from "@/lib/types";
import { apiLimiter } from "@/lib/rate-limit";

function destinationForRole(role: "candidate" | "recruiter") {
  return role === "candidate" ? "/candidate/intro" : "/recruiter";
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
) {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await apiLimiter.limit(`signin_${ip}`);

  if (!success) {
    return { error: "Too many sign in attempts. Please try again later." };
  }

  const email    = String(formData.get("email")    ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  // Optional role hint — lets the same demo credentials sign in as recruiter or candidate
  const roleHint = String(formData.get("roleHint") ?? "").trim() || undefined;

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await authenticateUser(email, password, roleHint);

  if (!user) {
    return { error: "We could not sign you in with those credentials." };
  }

  await createSession(user);
  redirect(destinationForRole(user.role));
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
) {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await apiLimiter.limit(`signup_${ip}`);

  if (!success) {
    return { error: "Too many sign up attempts. Please try again later." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role =
    String(formData.get("role") ?? "candidate").trim() === "recruiter"
      ? "recruiter"
      : "candidate";

  if (!name || !email || !password) {
    return { error: "Complete all fields to create your account." };
  }

  try {
    const user = await registerUser({ name, email, password, role });
    await createSession(user);
    redirect(destinationForRole(role));
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "We could not create the account.",
    };
  }
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}
