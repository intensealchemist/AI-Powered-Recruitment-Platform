import { ProfileBuilder } from "@/components/candidate/profile-builder";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getCandidateProfile } from "@/lib/data";

export default async function CandidateBuilderPage() {
  const user = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  if (!profile) {
    return (
      <Card className="p-8 text-sm text-slate-600">
        We could not load your profile builder right now.
      </Card>
    );
  }

  return <ProfileBuilder initialProfile={profile} />;
}
