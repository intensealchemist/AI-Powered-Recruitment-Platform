import { NextResponse } from "next/server";

// OAuth via PocketBase has been removed. Turso/libSQL does not support OAuth provider flows
// natively. OAuth should be implemented via NextAuth.js or a similar library if needed.
// This route now redirects with an informative message.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (provider !== "google" && provider !== "github") {
    return NextResponse.redirect(new URL("/sign-in?oauth=unsupported", request.url));
  }

  // OAuth via an external provider requires a dedicated auth service.
  // Redirect users to sign in with email/password in the meantime.
  return NextResponse.redirect(new URL("/sign-in?oauth=unavailable", request.url));
}
