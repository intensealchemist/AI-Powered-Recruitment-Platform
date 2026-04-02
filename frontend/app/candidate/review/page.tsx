import { ProfileReview } from "@/components/candidate/profile-review";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getCandidateProfile } from "@/lib/data";

export default async function CandidateReviewPage() {
  const user = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  if (!profile) {
    return (
      <Card className="p-8 text-sm text-slate-600">
        We could not load your review screen right now.
      </Card>
    );
  }

  return <ProfileReview initialProfile={profile} />;
}
