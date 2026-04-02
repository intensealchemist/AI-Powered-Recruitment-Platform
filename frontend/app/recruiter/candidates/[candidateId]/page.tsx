import { notFound } from "next/navigation";

import { CandidateProfileView } from "@/components/recruiter/candidate-profile-view";
import { requireSession } from "@/lib/auth";
import { listCandidates } from "@/lib/data";

export default async function RecruiterCandidatePage({
  params,
}: {
  params: Promise<{ candidateId: string }>;
}) {
  await requireSession("recruiter");
  const { candidateId } = await params;
  const candidates = await listCandidates();
  const candidate = candidates.find((item) => item.candidateId === candidateId);

  if (!candidate) {
    notFound();
  }

  return <CandidateProfileView candidate={candidate} />;
}
