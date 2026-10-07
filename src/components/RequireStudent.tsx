import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequireAuth } from "@/components/RequireAuth";
import { getActiveStudent, useScholarStore } from "@/lib/scholar/store";
import { GraduationCap, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

function SignInRequired({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useScholarStore();
  const student = getActiveStudent(store);

  /* Local session exists → the requested page is allowed through. */
  if (student) return <>{children}</>;

  const returnTo = `${location.pathname}${location.search}`;
  const signInHref = `/auth?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="glass-deep w-full max-w-md border-white/12">
        <CardHeader className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl gradient-button">
            <GraduationCap className="size-6" />
          </span>
          <CardTitle className="font-display text-xl">
            Sign in to Scholar AI
          </CardTitle>
          <CardDescription>
            Your scholarships, applications and profile live behind your
            student account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          You&apos;ll come straight back to this page after signing in.
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="gradient-button w-full border-0"
            onClick={() => navigate(signInHref)}
          >
            Sign in
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => navigate("/")}
          >
            Back to home
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

/**
 * Guards the authenticated Scholar AI workspace.
 *
 * The prototype keeps the signed-in student in local storage (spec: use local
 * / mock data when no backend is available), so a local session always wins.
 * The template's `RequireAuth` wrapper still runs for visitors without one —
 * it preserves the requested path through `/auth?returnTo=...`.
 */
export function RequireStudent({ children }: { children: ReactNode }) {
  const store = useScholarStore();
  const student = getActiveStudent(store);

  if (student) return <>{children}</>;

  return (
    <RequireAuth
      title="Sign in to Scholar AI"
      description="Your scholarships, applications and profile live in your Scholar AI account."
    >
      <SignInRequired>{children}</SignInRequired>
    </RequireAuth>
  );
}
