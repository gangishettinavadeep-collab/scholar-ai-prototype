import {
  ArrowRight,
  Clock,
  Compass,
  GraduationCap,
  Target,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatDeadline,
  isClosingSoon,
  scholarshipMatchesProfile,
} from "@/lib/scholar/data";
import {
  applicationsFor,
  getActiveStudent,
  profileCompletion,
  recommendedScholarships,
  statusTone,
  useScholarStore,
} from "@/lib/scholar/store";

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const NEXT_STEPS = [
  "Complete your Web Development course",
  "Apply to 3 matching internships",
  "Build your portfolio project",
];

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export default function Overview() {
  const store = useScholarStore();
  const student = getActiveStudent(store);
  const navigate = useNavigate();

  if (!student) return null;

  const firstName = student.fullName.split(" ")[0] || "there";
  const completion = profileCompletion(student);
  const applications = applicationsFor(store, student.id);
  const recommendations = recommendedScholarships(student, 3);
  const matchingCount = recommendedScholarships(
    student,
  ).filter((scholarship) => scholarshipMatchesProfile(scholarship, student))
    .length;
  const closingSoon = recommendedScholarships(student).filter((scholarship) =>
    isClosingSoon(scholarship.deadline),
  ).length;

  const stats = [
    {
      label: "Profile completion",
      value: `${completion.percent}%`,
      icon: UserIcon,
      accent: "text-cyan-300",
    },
    {
      label: "Applications sent",
      value: String(applications.length),
      icon: Target,
      accent: "text-violet-300",
    },
    {
      label: "Matching scholarships",
      value: String(matchingCount),
      icon: GraduationCap,
      accent: "text-fuchsia-300",
    },
    {
      label: "Closing in 30 days",
      value: String(closingSoon),
      icon: Clock,
      accent: "text-amber-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---------------- greeting + next best step ---------------- */}
      <section className="glass relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
        <div className="orb pointer-events-none absolute -top-24 right-[-4%] size-64 bg-cyan-500/25" />
        <div className="orb pointer-events-none absolute bottom-[-30%] left-[10%] size-56 bg-violet-600/25" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Student dashboard
            </p>
            <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {greetingForNow()}, {firstName} 👋
            </h1>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#05071a]/60 p-4 sm:p-5">
              <p className="text-sm font-semibold text-gradient-soft">
                Your next best step:
              </p>
              <ol className="mt-3 space-y-2.5">
                {NEXT_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        index === 0
                          ? "bg-gradient-to-br from-cyan-400 to-violet-500 text-[#04121c]"
                          : "border border-white/15 bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className={index === 0 ? "text-foreground" : "text-muted-foreground"}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[11px] text-muted-foreground">
                Guided by the Scholar AI roadmap for {student.careerInterest} ·{" "}
                {student.branch} · graduating {student.gradYear}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 lg:w-64">
            <Button
              size="lg"
              className="gradient-button border-0"
              onClick={() => navigate("/dashboard/scholarships")}
            >
              <Compass className="size-4" />
              Find scholarships
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/5 hover:border-cyan-400/50"
              onClick={() => navigate("/dashboard/profile")}
            >
              <UserIcon className="size-4" />
              {completion.percent < 100
                ? "Complete your profile"
                : "View your profile"}
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- stats ---------------- */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="glass gap-3 rounded-3xl border-white/10 py-5"
          >
            <CardContent className="px-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className={`size-4 ${stat.accent}`} />
              </div>
              <p className="font-display mt-2 text-3xl font-semibold">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ---------------- profile strength + recommendations ---------------- */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        {/* profile */}
        <Card className="glass rounded-3xl border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Student profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-[#04121c]">
                {student.fullName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "S"}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{student.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {student.college || "College not added"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Profile completion
                </span>
                <span className="font-semibold text-cyan-300">
                  {completion.percent}%
                </span>
              </div>
              <Progress
                value={completion.percent}
                className="mt-2 h-2 bg-white/10"
              />
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-muted-foreground">Degree</dt>
                <dd className="mt-1 font-medium">
                  {student.degree} · {student.branch}
                </dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-muted-foreground">Graduating</dt>
                <dd className="mt-1 font-medium">{student.gradYear}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-muted-foreground">Career interest</dt>
                <dd className="mt-1 font-medium">{student.careerInterest}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <dt className="text-muted-foreground">Skills</dt>
                <dd className="mt-1 font-medium">{student.skills.length}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-1.5">
              {student.skills.slice(0, 6).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="border-white/12 text-muted-foreground"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-white/12 bg-white/5 hover:border-cyan-400/50"
              onClick={() => navigate("/dashboard/profile")}
            >
              Edit profile
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* recommendations */}
        <Card className="glass rounded-3xl border-white/10">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-base">
              Recommended scholarships
            </CardTitle>
            <Button
              variant="link"
              className="h-auto px-0 text-cyan-300"
              onClick={() => navigate("/dashboard/scholarships")}
            >
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((scholarship) => {
              const matches = scholarshipMatchesProfile(scholarship, student);
              return (
                <button
                  key={scholarship.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/dashboard/scholarships?scholarship=${scholarship.id}`,
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-cyan-400/40 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {scholarship.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        matches
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                          : "border-white/12 text-muted-foreground"
                      }
                    >
                      {matches ? "Matches your profile" : scholarship.category}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scholarship.organization} · {scholarship.amount}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      Closes {formatDeadline(scholarship.deadline)}
                      {isClosingSoon(scholarship.deadline) && (
                        <span className="text-amber-300">· closing soon</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-300">
                      View details
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* ---------------- recent applications ---------------- */}
      <section>
        <Card className="glass rounded-3xl border-white/10">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-base">
              Recent applications
            </CardTitle>
            <Badge
              variant="outline"
              className="border-white/12 text-muted-foreground"
            >
              {applications.length} total
            </Badge>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center">
                <TrendingUp className="size-6 text-cyan-300" />
                <p className="text-sm text-muted-foreground">
                  No applications yet. Apply to a scholarship and it will show up
                  here automatically.
                </p>
                <Button
                  className="gradient-button border-0"
                  onClick={() => navigate("/dashboard/scholarships")}
                >
                  Browse scholarships
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-white/8">
                {applications.slice(0, 6).map((application) => (
                  <li
                    key={application.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {application.refName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {application.organization} · applied{" "}
                        {formatDate(application.submittedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={statusTone(application.status)}
                      >
                        {application.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-cyan-300"
                        onClick={() =>
                          navigate(
                            `/dashboard/scholarships?scholarship=${application.refId}`,
                          )
                        }
                      >
                        View
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
