"use server";

import { redirect } from "next/navigation";

import { clearSession, createSession } from "@/lib/auth";
import { authenticateUser, registerUser } from "@/lib/data";
import { AuthActionState } from "@/lib/types";

function destinationForRole(role: "candidate" | "recruiter") {
  return role === "candidate" ? "/candidate/intro" : "/recruiter";
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await authenticateUser(email, password);

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
