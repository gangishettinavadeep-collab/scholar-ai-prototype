import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { BrandLockup } from "@/components/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANCHES,
  CAREER_INTERESTS,
  DEGREES,
  GRAD_YEARS,
} from "@/lib/scholar/data";
import {
  ADMIN_CREDENTIALS,
  DEMO_CREDENTIALS,
  getActiveStudent,
  isAdmin,
  registerStudent,
  resetStudentPassword,
  signInStudent,
  useScholarStore,
  type Student,
} from "@/lib/scholar/store";
import { cn } from "@/lib/utils";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirect(returnTo: string | null, fallback: string) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

const inputClass =
  "h-11 rounded-xl border-white/12 bg-white/5 text-foreground placeholder:text-muted-foreground/70 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30";

const selectTriggerClass =
  "h-11 w-full rounded-xl border-white/12 bg-white/5 text-sm focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30";

function Field({
  label,
  htmlFor,
  children,
  hint,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

function Auth({ redirectAfterAuth = "/dashboard" }: AuthProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedReturn = searchParams.get("returnTo");
  const returnTo = resolveRedirect(requestedReturn, redirectAfterAuth);
  const store = useScholarStore();
  const activeStudent = getActiveStudent(store);

  /**
   * Where to land after a successful sign-in: an explicit ?returnTo= wins,
   * otherwise admins go to the /admin workspace and everyone else to the
   * student dashboard.
   */
  const destinationAfterAuth = useCallback(
    (user: Student | null): string =>
      requestedReturn?.startsWith("/") && !requestedReturn.startsWith("//")
        ? returnTo
        : isAdmin(user)
          ? "/admin"
          : redirectAfterAuth,
    [requestedReturn, returnTo, redirectAfterAuth],
  );

  const [mode, setMode] = useState<"signin" | "register" | "forgot">(() => {
    const requested = searchParams.get("mode");
    return requested === "register" || requested === "forgot"
      ? requested
      : "signin";
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (activeStudent)
      navigate(destinationAfterAuth(activeStudent), { replace: true });
  }, [activeStudent, navigate, destinationAfterAuth]);

  const changeMode = (next: "signin" | "register" | "forgot") => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const finish = () => setIsSubmitting(false);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const result = signInStudent(
      String(data.get("email") ?? ""),
      String(data.get("password") ?? ""),
    );
    if (!result.ok) {
      setError(result.error);
      finish();
      return;
    }
    setIsSubmitting(true);
    navigate(destinationAfterAuth(getActiveStudent()), { replace: true });
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result = registerStudent({
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      password,
      college: String(data.get("college") ?? ""),
      degree: String(data.get("degree") ?? ""),
      branch: String(data.get("branch") ?? ""),
      gradYear: String(data.get("gradYear") ?? ""),
      skills: String(data.get("skills") ?? ""),
      careerInterest: String(data.get("careerInterest") ?? ""),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setIsSubmitting(true);
    navigate(destinationAfterAuth(getActiveStudent()), { replace: true });
  };

  const handleForgot = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    const result = resetStudentPassword(
      String(data.get("email") ?? ""),
      password,
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice("Password updated. You can sign in now.");
    setMode("signin");
  };

  const useDemoAccount = () => {
    setError(null);
    const result = signInStudent(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    if (result.ok) {
      setIsSubmitting(true);
      navigate(destinationAfterAuth(getActiveStudent()), { replace: true });
    } else {
      setError(result.error);
    }
  };

  const useAdminAccount = () => {
    setError(null);
    const result = signInStudent(
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password,
    );
    if (result.ok) {
      setIsSubmitting(true);
      navigate(destinationAfterAuth(getActiveStudent()), { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* background */}
      <div className="starfield pointer-events-none absolute inset-0 opacity-60" />
      <div className="orb pointer-events-none absolute -top-24 left-[10%] size-96 bg-cyan-500/35" />
      <div className="orb pointer-events-none absolute bottom-[-15%] right-[-5%] size-[440px] bg-violet-600/35" />
      <div className="orb pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 bg-fuchsia-600/20" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_460px] lg:gap-16">
        {/* brand side */}
        <div className="hidden lg:block">
          <BrandLockup onClick={() => navigate("/")} />
          <h1 className="font-display mt-8 text-4xl font-semibold leading-tight tracking-tight">
            One profile for
            <br />
            <span className="text-gradient">scholarships</span>, learning &amp;
            careers.
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Scholar AI connects students with scholarships, education,
            internships, certifications and career opportunities — and keeps
            every application in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {["Learn", "Earn", "Experience", "Get Certified", "Get Hired"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ),
            )}
          </div>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Search and filter the demo scholarship library",
              "Apply in a few clicks and track it on your dashboard",
              "Profile-aware recommendations for your branch and goals",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-cyan-300">
                  <Sparkles className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="glass mt-10 inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="border-amber-300/40 bg-amber-400/10 text-amber-200"
            >
              Prototype
            </Badge>
            Accounts are stored in this browser only — no data leaves your
            device.
          </div>
        </div>

        {/* form side */}
        <div className="w-full">
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandLockup onClick={() => navigate("/")} />
          </div>

          <Card className="glass-deep rounded-3xl border-white/12 shadow-[0_40px_90px_-50px_rgba(34,211,238,0.6)]">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-2xl">
                {mode === "register"
                  ? "Create your student account"
                  : mode === "forgot"
                    ? "Reset your password"
                    : "Welcome back"}
              </CardTitle>
              <CardDescription>
                {mode === "register"
                  ? "Ten fields, one minute — this becomes your Scholar AI profile."
                  : mode === "forgot"
                    ? "Set a new password for your local prototype account."
                    : "Sign in to continue to your dashboard."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {mode !== "forgot" && (
                <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => changeMode("signin")}
                    className={cn(
                      "rounded-xl py-2 text-sm font-medium transition-colors",
                      mode === "signin"
                        ? "bg-gradient-to-r from-cyan-400/90 to-violet-500/90 text-[#04121c]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className={cn(
                      "rounded-xl py-2 text-sm font-medium transition-colors",
                      mode === "register"
                        ? "bg-gradient-to-r from-cyan-400/90 to-violet-500/90 text-[#04121c]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Create account
                  </button>
                </div>
              )}

              {mode === "signin" && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Field label="Email" htmlFor="signin-email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@college.edu"
                        defaultValue={DEMO_CREDENTIALS.email}
                        className={cn(inputClass, "pl-9")}
                      />
                    </div>
                  </Field>

                  <Field label="Password" htmlFor="signin-password">
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        defaultValue={DEMO_CREDENTIALS.password}
                        className={cn(inputClass, "pr-10 pl-9")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute top-3.5 right-3 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      className="text-cyan-300 transition-colors hover:text-cyan-200"
                      onClick={() => changeMode("forgot")}
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => changeMode("register")}
                    >
                      Create account
                    </button>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="gradient-button w-full border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/15 bg-white/5 hover:border-cyan-400/50"
                    onClick={useDemoAccount}
                  >
                    <GraduationCap className="size-4" />
                    Use the demo student account
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Demo login · {DEMO_CREDENTIALS.email} /{" "}
                    {DEMO_CREDENTIALS.password}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/15 bg-white/5 hover:border-violet-400/50"
                    onClick={useAdminAccount}
                  >
                    <ShieldCheck className="size-4" />
                    Use the admin account
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Admin login · {ADMIN_CREDENTIALS.email} /{" "}
                    {ADMIN_CREDENTIALS.password}
                  </p>
                </form>
              )}

              {mode === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      htmlFor="fullName"
                      className="sm:col-span-2"
                    >
                      <div className="relative">
                        <User className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          name="fullName"
                          required
                          placeholder="Jayanth Kumar"
                          className={cn(inputClass, "pl-9")}
                        />
                      </div>
                    </Field>

                    <Field label="Email" htmlFor="reg-email">
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@college.edu"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Phone" htmlFor="phone">
                      <Input
                        id="phone"
                        name="phone"
                        required
                        placeholder="+91 98765 43210"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Password"
                      htmlFor="reg-password"
                      hint="At least 6 characters"
                      className="sm:col-span-2"
                    >
                      <div className="relative">
                        <Lock className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className={cn(inputClass, "pr-10 pl-9")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute top-3.5 right-3 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </Field>

                    <Field
                      label="College"
                      htmlFor="college"
                      className="sm:col-span-2"
                    >
                      <Input
                        id="college"
                        name="college"
                        required
                        placeholder="Sri Venkateswara Institute of Technology"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Degree" htmlFor="degree">
                      <Select name="degree" defaultValue="B.Tech">
                        <SelectTrigger
                          id="degree"
                          className={selectTriggerClass}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/12 bg-[#0b1130]">
                          {DEGREES.map((degree) => (
                            <SelectItem key={degree} value={degree}>
                              {degree}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Branch" htmlFor="branch">
                      <Select name="branch" defaultValue="CSE">
                        <SelectTrigger
                          id="branch"
                          className={selectTriggerClass}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/12 bg-[#0b1130]">
                          {BRANCHES.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Graduation year" htmlFor="gradYear">
                      <Select name="gradYear" defaultValue="2027">
                        <SelectTrigger
                          id="gradYear"
                          className={selectTriggerClass}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/12 bg-[#0b1130]">
                          {GRAD_YEARS.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field
                      label="Career interest"
                      htmlFor="careerInterest"
                    >
                      <Select
                        name="careerInterest"
                        defaultValue="Software Development"
                      >
                        <SelectTrigger
                          id="careerInterest"
                          className={selectTriggerClass}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/12 bg-[#0b1130]">
                          {CAREER_INTERESTS.map((interest) => (
                            <SelectItem key={interest} value={interest}>
                              {interest}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field
                      label="Skills"
                      htmlFor="skills"
                      hint="Comma separated — used for matching"
                      className="sm:col-span-2"
                    >
                      <Input
                        id="skills"
                        name="skills"
                        required
                        placeholder="React, Python, SQL, Figma"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="gradient-button w-full border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Register &amp; open dashboard
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Already registered?{" "}
                    <button
                      type="button"
                      className="text-cyan-300 transition-colors hover:text-cyan-200"
                      onClick={() => changeMode("signin")}
                    >
                      Login
                    </button>
                  </p>
                </form>
              )}

              {mode === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <Field label="Email" htmlFor="forgot-email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@college.edu"
                        className={cn(inputClass, "pl-9")}
                      />
                    </div>
                  </Field>
                  <Field
                    label="New password"
                    htmlFor="forgot-password"
                    hint="At least 6 characters"
                  >
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                      <Input
                        id="forgot-password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className={cn(inputClass, "pl-9")}
                      />
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    className="gradient-button w-full border-0"
                  >
                    Update password
                    <ArrowRight className="size-4" />
                  </Button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => changeMode("signin")}
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to sign in
                  </button>
                </form>
              )}

              {error && (
                <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {error}
                </p>
              )}
              {notice && !error && (
                <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  {notice}
                </p>
              )}
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Prototype auth · credentials are kept in your browser&apos;s local
            storage
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return <Auth {...props} />;
}
