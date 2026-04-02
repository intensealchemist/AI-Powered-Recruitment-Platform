import { Card } from "@/components/ui/card";
import { CompareView } from "@/components/recruiter/compare-view";
import { requireSession } from "@/lib/auth";
import { listCandidates } from "@/lib/data";

export default async function RecruiterComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  await requireSession("recruiter");

  const [{ ids }, candidates] = await Promise.all([searchParams, listCandidates()]);
  const selectedIds = ids?.split(",").filter(Boolean).slice(0, 3) ?? [];
  const selectedCandidates =
    selectedIds.length > 0
      ? candidates.filter((candidate) => selectedIds.includes(candidate.candidateId))
      : candidates.slice(0, 3);

  if (selectedCandidates.length === 0) {
    return (
      <Card className="p-8 text-sm text-slate-600">
        There are no candidates available to compare right now.
      </Card>
    );
  }

  return <CompareView candidates={selectedCandidates} />;
}
