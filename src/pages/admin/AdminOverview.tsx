import {
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getActiveStudent,
  statusTone,
  useScholarStore,
} from "@/lib/scholar/store";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export default function AdminOverview() {
  const store = useScholarStore();
  const navigate = useNavigate();
  const admin = getActiveStudent(store);

  const admins = store.students.filter((s) => s.role === "admin").length;
  const students = store.students.length - admins;
  const approved = store.applications.filter(
    (a) => a.status === "Approved",
  ).length;
  const rejected = store.applications.filter(
    (a) => a.status === "Rejected",
  ).length;
  const pending = store.applications.length - approved - rejected;

  const stats = [
    {
      label: "Students",
      value: String(students),
      icon: Users,
      accent: "text-cyan-300",
    },
    {
      label: "Applications",
      value: String(store.applications.length),
      icon: ClipboardList,
      accent: "text-violet-300",
    },
    {
      label: "Pending review",
      value: String(pending),
      icon: Sparkles,
      accent: "text-amber-300",
    },
    {
      label: "Scholarships live",
      value: String(store.scholarships.length),
      icon: GraduationCap,
      accent: "text-fuchsia-300",
    },
  ];

  const recentApplications = [...store.applications]
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 6);
  const recentStudents = [...store.students]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  const nameFor = (studentId: string) =>
    store.students.find((s) => s.id === studentId)?.fullName ??
    "Removed student";

  return (
    <div className="space-y-6">
      {/* header */}
      <section className="glass relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
        <div className="orb pointer-events-none absolute -top-24 right-[-4%] size-64 bg-violet-500/25" />
        <div className="orb pointer-events-none absolute bottom-[-30%] left-[8%] size-56 bg-cyan-600/25" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
              Admin · control centre
            </p>
            <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Admin control centre
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Welcome back{admin ? `, ${admin.fullName}` : ""}. Review
              applications, manage student accounts and keep the scholarship
              catalogue up to date — all from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="gradient-button border-0"
              onClick={() => navigate("/admin/applications")}
            >
              Review {pending} pending
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-white/5"
              onClick={() => navigate("/admin/students")}
            >
              <Users className="size-4" />
              Students
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-white/5"
              onClick={() => navigate("/admin/scholarships")}
            >
              <GraduationCap className="size-4" />
              Scholarships
            </Button>
          </div>
        </div>
      </section>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="glass rounded-3xl border-white/10"
          >
            <CardContent className="flex items-center gap-4 px-5 py-4">
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl bg-white/5 ${stat.accent}`}
              >
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="glass rounded-3xl border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Recent applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No applications yet.
              </p>
            )}
            {recentApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {nameFor(application.studentId)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {application.refName} · {formatDate(application.submittedAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusTone(application.status)}
                >
                  {application.status}
                </Badge>
              </div>
            ))}
            {recentApplications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-cyan-300"
                onClick={() => navigate("/admin/applications")}
              >
                Review all applications
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="glass rounded-3xl border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Latest accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {student.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {student.email} · joined {formatDate(student.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    student.role === "admin"
                      ? "border-violet-300/40 bg-violet-400/10 text-violet-200"
                      : "border-white/15 text-muted-foreground"
                  }
                >
                  {student.role === "admin" ? "Admin" : "Student"}
                </Badge>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-cyan-300"
              onClick={() => navigate("/admin/students")}
            >
              Manage students
              <ArrowRight className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
