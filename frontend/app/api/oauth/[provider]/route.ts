import { NextResponse } from "next/server";

import { createPocketBaseClient, hasPocketBaseConfig } from "@/lib/pocketbase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!hasPocketBaseConfig()) {
    return NextResponse.redirect(new URL("/sign-in?oauth=unavailable", request.url));
  }

  if (provider !== "google" && provider !== "github") {
    return NextResponse.redirect(new URL("/sign-in?oauth=unsupported", request.url));
  }

  const client = createPocketBaseClient();
  const methods = await client.collection("users").listAuthMethods();
  const authProvider = methods.oauth2.providers.find((item) => item.name === provider);

  if (!authProvider) {
    return NextResponse.redirect(new URL("/sign-in?oauth=disabled", request.url));
  }

  return NextResponse.redirect(authProvider.authURL);
}
