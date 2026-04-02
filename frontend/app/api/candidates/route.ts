import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { listCandidates } from "@/lib/data";

export async function GET() {
  await requireSession("recruiter");
  const candidates = await listCandidates();

  return NextResponse.json(candidates);
}
