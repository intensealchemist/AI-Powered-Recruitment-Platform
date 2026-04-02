import { CandidateDashboard } from "@/components/recruiter/candidate-dashboard";
import { requireSession } from "@/lib/auth";

export default async function RecruiterDashboardPage() {
  await requireSession("recruiter");

  return <CandidateDashboard />;
}
