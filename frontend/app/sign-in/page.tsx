import { AuthCard } from "@/components/auth/auth-card";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <AuthCard mode="sign-in" />
    </div>
  );
}
