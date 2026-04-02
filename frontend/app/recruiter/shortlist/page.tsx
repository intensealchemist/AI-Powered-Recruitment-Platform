import { ShortlistBoard } from "@/components/recruiter/shortlist-board";
import { requireSession } from "@/lib/auth";
import { listCandidates } from "@/lib/data";

export default async function RecruiterShortlistPage() {
  await requireSession("recruiter");
  const candidates = await listCandidates();

  return <ShortlistBoard candidates={candidates} />;
}
