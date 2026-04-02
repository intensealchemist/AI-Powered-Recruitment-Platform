import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth";
import { listCandidates } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> },
) {
  await requireSession("recruiter");
  const { candidateId } = await params;
  const candidates = await listCandidates();
  const candidate = candidates.find((item) => item.candidateId === candidateId);

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
  }

  return NextResponse.json(candidate);
}
