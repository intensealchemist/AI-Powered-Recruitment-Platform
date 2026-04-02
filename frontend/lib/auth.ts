import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getUserById } from "@/lib/data";
import { SessionUser, UserRole } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

const SESSION_COOKIE = "talentflow_session";

interface SessionCookiePayload {
  userId: string;
  role: UserRole;
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const payload: SessionCookiePayload = {
    userId: user.id,
    role: user.role,
  };

  cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  const payload = safeJsonParse<SessionCookiePayload | null>(raw, null);

  if (!payload) {
    return null;
  }

  return getUserById(payload.userId);
}

export async function requireSession(role?: UserRole) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (role && user.role !== role) {
    redirect(user.role === "candidate" ? "/candidate/intro" : "/recruiter");
  }

  return user;
}
