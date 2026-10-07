import { useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BRANCHES,
  CAREER_INTERESTS,
  DEGREES,
  GRAD_YEARS,
} from "@/lib/scholar/data";
import {
  applicationsFor,
  getActiveStudent,
  profileCompletion,
  updateStudent,
  useScholarStore,
} from "@/lib/scholar/store";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10">
        <Icon className="size-4 text-cyan-300" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || "Not added yet"}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const store = useScholarStore();
  const student = getActiveStudent(store);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!student) return null;

  const completion = profileCompletion(student);
  const applications = applicationsFor(store, student.id);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    if (!fullName) {
      setError("Full name is required.");
      return;
    }
    setError(null);
    updateStudent(student.id, {
      fullName,
      phone: String(data.get("phone") ?? "").trim(),
      college: String(data.get("college") ?? "").trim(),
      degree: String(data.get("degree") ?? student.degree),
      branch: String(data.get("branch") ?? student.branch),
      gradYear: String(data.get("gradYear") ?? student.gradYear),
      careerInterest: String(data.get("careerInterest") ?? student.careerInterest),
      bio: String(data.get("bio") ?? "").trim(),
      portfolio: String(data.get("portfolio") ?? "").trim(),
      skills: String(data.get("skills") ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Student record
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Everything the scholarship matcher uses to decide which opportunities
            fit you.
          </p>
        </div>
        <Button
          className="gradient-button border-0"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-4" />
          Edit Profile
        </Button>
      </div>

      {/* identity */}
      <Card className="glass rounded-3xl border-white/10">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 text-xl font-bold text-[#04121c]">
            {student.fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("") || "S"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold">
              {student.fullName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {student.bio || "Add a headline so reviewers know your focus."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-white/12 text-muted-foreground"
              >
                {student.degree} · {student.branch}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/12 text-muted-foreground"
              >
                Class of {student.gradYear}
              </Badge>
              <Badge className="border-transparent bg-cyan-400/15 text-cyan-200">
                {student.careerInterest}
              </Badge>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profile completion</span>
              <span className="font-semibold text-cyan-300">
                {completion.percent}%
              </span>
            </div>
            <Progress
              value={completion.percent}
              className="mt-2 h-2 bg-white/10"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              {completion.missing.length === 0
                ? "All fields complete — recommendations are fully unlocked."
                : `Missing: ${completion.missing.join(", ")}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* personal + academic */}
        <Card className="glass rounded-3xl border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Personal &amp; academic
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <InfoRow icon={Mail} label="Email" value={student.email} />
            <InfoRow icon={Phone} label="Phone" value={student.phone} />
            <InfoRow
              icon={MapPin}
              label="College"
              value={student.college}
            />
            <InfoRow
              icon={Calendar}
              label="Graduation year"
              value={student.gradYear}
            />
            <InfoRow
              icon={BookOpen}
              label="Degree & branch"
              value={`${student.degree} · ${student.branch}`}
            />
            <InfoRow
              icon={Award}
              label="Portfolio"
              value={student.portfolio}
            />
          </CardContent>
        </Card>

        {/* skills + interests */}
        <div className="space-y-6">
          <Card className="glass rounded-3xl border-white/10">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-base">Skills</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground hover:text-cyan-300"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {student.skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills added yet — add a few so recommendations can match
                  you.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass rounded-3xl border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5">
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t applied to anything yet.
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
                <ul className="space-y-2">
                  {applications.map((application) => (
                    <li
                      key={application.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {application.refName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {application.organization} ·{" "}
                            {formatDate(application.submittedAt)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            application.status === "Under review"
                              ? "border-amber-300/40 bg-amber-400/10 text-amber-200"
                              : "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        className="mt-2 flex items-center gap-1 text-xs text-cyan-300 transition-colors hover:text-cyan-200"
                        onClick={() =>
                          navigate(
                            `/dashboard/scholarships?scholarship=${application.refId}`,
                          )
                        }
                      >
                        View scholarship
                        <ArrowRight className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* edit dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="glass-deep max-h-[90vh] overflow-y-auto border-white/12 sm:max-w-2xl">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="font-display">Edit profile</DialogTitle>
              <DialogDescription>
                Updates are saved to this browser and immediately change your
                scholarship matches.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="p-name" className="text-xs text-muted-foreground">
                  Full name
                </Label>
                <Input
                  id="p-name"
                  name="fullName"
                  required
                  defaultValue={student.fullName}
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p-phone" className="text-xs text-muted-foreground">
                  Phone
                </Label>
                <Input
                  id="p-phone"
                  name="phone"
                  defaultValue={student.phone}
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p-college" className="text-xs text-muted-foreground">
                  College
                </Label>
                <Input
                  id="p-college"
                  name="college"
                  defaultValue={student.college}
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p-degree" className="text-xs text-muted-foreground">
                  Degree
                </Label>
                <Select name="degree" defaultValue={student.degree}>
                  <SelectTrigger
                    id="p-degree"
                    className="h-10 w-full border-white/12 bg-white/5"
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
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p-branch" className="text-xs text-muted-foreground">
                  Branch
                </Label>
                <Select name="branch" defaultValue={student.branch}>
                  <SelectTrigger
                    id="p-branch"
                    className="h-10 w-full border-white/12 bg-white/5"
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
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p-year" className="text-xs text-muted-foreground">
                  Graduation year
                </Label>
                <Select name="gradYear" defaultValue={student.gradYear}>
                  <SelectTrigger
                    id="p-year"
                    className="h-10 w-full border-white/12 bg-white/5"
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
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p-interest" className="text-xs text-muted-foreground">
                  Career interest
                </Label>
                <Select
                  name="careerInterest"
                  defaultValue={student.careerInterest}
                >
                  <SelectTrigger
                    id="p-interest"
                    className="h-10 w-full border-white/12 bg-white/5"
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
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="p-skills" className="text-xs text-muted-foreground">
                  Skills (comma separated)
                </Label>
                <Input
                  id="p-skills"
                  name="skills"
                  defaultValue={student.skills.join(", ")}
                  placeholder="React, Python, SQL"
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="p-bio" className="text-xs text-muted-foreground">
                  Headline
                </Label>
                <Textarea
                  id="p-bio"
                  name="bio"
                  rows={3}
                  defaultValue={student.bio}
                  placeholder="Final-year CSE student who ships full-stack projects…"
                  className="rounded-xl border-white/12 bg-white/5"
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="p-portfolio" className="text-xs text-muted-foreground">
                  Portfolio link
                </Label>
                <Input
                  id="p-portfolio"
                  name="portfolio"
                  defaultValue={student.portfolio}
                  placeholder="https://"
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>
            </div>

            {error && (
              <p className="mb-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-white/5"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-button border-0">
                <Check className="size-4" />
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
