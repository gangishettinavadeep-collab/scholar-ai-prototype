import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  Compass,
  GraduationCap,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEMO_DATA_NOTICE,
  ELIGIBILITY_OPTIONS,
  SCHOLARSHIP_CATEGORIES,
  SCHOLARSHIP_LEVELS,
  SCHOLARSHIPS,
  formatDeadline,
  isClosingSoon,
  isExpired,
  matchesEligibilityFilter,
  scholarshipMatchesProfile,
  type Scholarship,
} from "@/lib/scholar/data";
import {
  applyForScholarship,
  applicationsFor,
  getActiveStudent,
  hasApplied,
  useScholarStore,
  type Application,
} from "@/lib/scholar/store";

export default function Scholarships() {
  const store = useScholarStore();
  const student = getActiveStudent(store);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [location, setLocation] = useState("all");
  const [eligibility, setEligibility] = useState("any");

  const [detailId, setDetailId] = useState<string | null>(
    searchParams.get("scholarship"),
  );
  const [applyTarget, setApplyTarget] = useState<Scholarship | null>(null);
  const [submitted, setSubmitted] = useState<Application | null>(null);

  const locations = useMemo(
    () => Array.from(new Set(SCHOLARSHIPS.map((s) => s.location))).sort(),
    [],
  );

  // Radix only portals the selected item's text into the trigger client-side
  // (after mount), which leaves every filter blank in SSR / first paint.
  // Passing the current label as children keeps the trigger filled at all
  // times — Radix renders `children` whenever a value is set.
  const categoryLabel = category === "all" ? "All categories" : category;
  const levelLabel = level === "all" ? "All education levels" : level;
  const locationLabel = location === "all" ? "All locations" : location;
  const eligibilityLabel =
    ELIGIBILITY_OPTIONS.find((option) => option.value === eligibility)
      ?.label ?? "Any eligibility";

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SCHOLARSHIPS.filter((scholarship) => {
      if (needle) {
        const haystack = [
          scholarship.name,
          scholarship.organization,
          scholarship.description,
          scholarship.category,
          scholarship.location,
          scholarship.eligibility,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (category !== "all" && scholarship.category !== category) return false;
      if (
        level !== "all" &&
        scholarship.level !== level &&
        scholarship.level !== "All levels"
      )
        return false;
      if (location !== "all" && scholarship.location !== location) return false;
      if (!matchesEligibilityFilter(scholarship, eligibility)) return false;
      return true;
    }).sort((a, b) => {
      const aMatch = student ? scholarshipMatchesProfile(a, student) : false;
      const bMatch = student ? scholarshipMatchesProfile(b, student) : false;
      if (aMatch !== bMatch) return aMatch ? -1 : 1;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [query, category, level, location, eligibility, student]);

  const detail = detailId
    ? SCHOLARSHIPS.find((s) => s.id === detailId) ?? null
    : null;

  const filtersActive =
    query.trim() !== "" ||
    category !== "all" ||
    level !== "all" ||
    location !== "all" ||
    eligibility !== "any";

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setLevel("all");
    setLocation("all");
    setEligibility("any");
  };

  const openDetails = (scholarship: Scholarship) => {
    setDetailId(scholarship.id);
    const next = new URLSearchParams(searchParams);
    next.set("scholarship", scholarship.id);
    setSearchParams(next, { replace: true });
  };

  const closeDetails = () => {
    setDetailId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("scholarship");
    setSearchParams(next, { replace: true });
  };

  const startApplication = (scholarship: Scholarship) => {
    setDetailId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("scholarship");
    setSearchParams(next, { replace: true });
    setApplyTarget(scholarship);
  };

  const appliedCount = applicationsFor(store, student?.id).length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Version 1 · discovery
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Scholarships
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Search the demo library, filter by category, education level,
            location and eligibility, then apply — every application is tracked
            on your dashboard.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-amber-300/40 bg-amber-400/10 text-amber-200"
        >
          Demo / sample data
        </Badge>
      </div>

      {/* filters */}
      <div className="glass rounded-3xl p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by scholarship, organisation or keyword…"
            className="h-11 rounded-xl border-white/12 bg-white/5 pl-10 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30"
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 w-full border-white/12 bg-white/5">
              <SelectValue placeholder="Category">
                {categoryLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#0b1130]">
              <SelectItem value="all">All categories</SelectItem>
              {SCHOLARSHIP_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="h-10 w-full border-white/12 bg-white/5">
              <SelectValue placeholder="Education level">
                {levelLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#0b1130]">
              <SelectItem value="all">All education levels</SelectItem>
              {SCHOLARSHIP_LEVELS.filter((item) => item !== "All levels").map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-10 w-full border-white/12 bg-white/5">
              <SelectValue placeholder="Location">
                {locationLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#0b1130]">
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eligibility} onValueChange={setEligibility}>
            <SelectTrigger className="h-10 w-full border-white/12 bg-white/5">
              <SelectValue placeholder="Eligibility">
                {eligibilityLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#0b1130]">
              {ELIGIBILITY_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{results.length}</span>{" "}
            of {SCHOLARSHIPS.length} demo scholarships
            {appliedCount > 0 && <> · {appliedCount} applied by you</>}
          </span>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-cyan-300"
              onClick={resetFilters}
            >
              <RotateCcw className="size-3.5" />
              Reset filters
            </Button>
          )}
        </div>
      </div>

      {/* results */}
      {results.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
          <Compass className="size-7 text-cyan-300" />
          <p className="font-medium">No scholarships match these filters</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Try widening the education level or eligibility filter — or clear
            everything and start again.
          </p>
          <Button
            className="gradient-button border-0"
            onClick={resetFilters}
          >
            <RotateCcw className="size-4" />
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {results.map((scholarship) => {
            const applied = hasApplied(store, student?.id, scholarship.id);
            const matches = student
              ? scholarshipMatchesProfile(scholarship, student)
              : false;
            const closed = isExpired(scholarship.deadline);

            return (
              <Card
                key={scholarship.id}
                className="glass glass-hover flex flex-col gap-4 rounded-3xl border-white/10 py-5"
              >
                <CardContent className="space-y-3 px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/15 text-muted-foreground"
                    >
                      {scholarship.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-amber-300/40 bg-amber-400/10 text-amber-200"
                    >
                      Demo data
                    </Badge>
                    {matches && (
                      <Badge className="border-transparent bg-cyan-400/15 text-cyan-200">
                        <Sparkles className="size-3" />
                        Profile match
                      </Badge>
                    )}
                    {applied && (
                      <Badge className="border-transparent bg-emerald-400/15 text-emerald-200">
                        <Check className="size-3" />
                        Applied
                      </Badge>
                    )}
                    {closed && (
                      <Badge
                        variant="outline"
                        className="border-rose-400/40 bg-rose-500/10 text-rose-200"
                      >
                        Closed
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h2 className="font-display text-lg leading-snug font-semibold">
                      {scholarship.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {scholarship.organization}
                    </p>
                  </div>

                  <p className="text-gradient-soft font-display text-xl font-semibold">
                    {scholarship.amount}
                  </p>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {scholarship.description}
                  </p>

                  <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Eligibility:
                      </span>{" "}
                      {scholarship.eligibility}
                    </p>
                    <p className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        Closes {formatDeadline(scholarship.deadline)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {scholarship.location}
                      </span>
                      {isClosingSoon(scholarship.deadline) && !closed && (
                        <span className="text-amber-300">Closing soon</span>
                      )}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="mt-auto flex gap-2 px-5">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/15 bg-white/5 hover:border-cyan-400/50"
                    onClick={() => openDetails(scholarship)}
                  >
                    View Details
                  </Button>
                  <Button
                    className="flex-1 gradient-button border-0"
                    disabled={closed || applied}
                    onClick={() => startApplication(scholarship)}
                  >
                    {applied ? "Applied" : closed ? "Closed" : "Apply"}
                    {!applied && !closed && <ArrowRight className="size-4" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{DEMO_DATA_NOTICE}</p>

      {/* ---------------- details dialog ---------------- */}
      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) closeDetails();
        }}
      >
        <DialogContent className="glass-deep max-h-[88vh] overflow-y-auto border-white/12 sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/15 text-muted-foreground"
                  >
                    {detail.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-amber-300/40 bg-amber-400/10 text-amber-200"
                  >
                    Demo data
                  </Badge>
                </div>
                <DialogTitle className="font-display pt-2 text-xl leading-snug">
                  {detail.name}
                </DialogTitle>
                <DialogDescription>
                  {detail.organization} · {detail.level} · {detail.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted-foreground">Benefit</p>
                    <p className="text-gradient-soft mt-1 font-display font-semibold">
                      {detail.amount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="mt-1 font-medium">{detail.duration}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="mt-1 font-medium">
                      {formatDeadline(detail.deadline)}
                      {isClosingSoon(detail.deadline) && (
                        <span className="block text-xs text-amber-300">
                          Closing soon
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <section>
                  <h3 className="font-display font-semibold">About</h3>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    {detail.description}
                  </p>
                </section>

                <section>
                  <h3 className="font-display font-semibold">Eligibility</h3>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    {detail.eligibility}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-white/12 text-muted-foreground"
                    >
                      {detail.level}
                    </Badge>
                    {(detail.yearGroups === "Any"
                      ? ["1st year", "2nd year", "3rd year", "Final year"]
                      : detail.yearGroups
                    ).map((year) => (
                      <Badge
                        key={year}
                        variant="outline"
                        className="border-white/12 text-muted-foreground"
                      >
                        {year}
                      </Badge>
                    ))}
                    {detail.branches.map((branch) => (
                      <Badge
                        key={branch}
                        variant="outline"
                        className="border-white/12 text-muted-foreground"
                      >
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-display font-semibold">What you get</h3>
                  <ul className="mt-2 space-y-2">
                    {detail.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-cyan-300">
                          <Check className="size-2.5" />
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </section>

                <p className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-amber-100/90">
                  {DEMO_DATA_NOTICE}
                </p>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5"
                  onClick={closeDetails}
                >
                  Close
                </Button>
                {hasApplied(store, student?.id, detail.id) ? (
                  <Button
                    className="border-0 bg-emerald-400/20 text-emerald-100"
                    disabled
                  >
                    <BadgeCheck className="size-4" />
                    Application submitted
                  </Button>
                ) : (
                  <Button
                    className="gradient-button border-0"
                    disabled={isExpired(detail.deadline)}
                    onClick={() => startApplication(detail)}
                  >
                    {isExpired(detail.deadline)
                      ? "Applications closed"
                      : "Apply now"}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------- application form ---------------- */}
      <ApplicationDialog
        scholarship={applyTarget}
        defaultName={student?.fullName ?? ""}
        defaultEmail={student?.email ?? ""}
        defaultPhone={student?.phone ?? ""}
        defaultCollege={student?.college ?? ""}
        onClose={() => setApplyTarget(null)}
        onSubmitted={(application) => {
          setApplyTarget(null);
          setSubmitted(application);
        }}
      />

      {/* ---------------- success ---------------- */}
      <Dialog
        open={Boolean(submitted)}
        onOpenChange={(open) => {
          if (!open) setSubmitted(null);
        }}
      >
        <DialogContent className="glass-deep border-white/12 sm:max-w-md">
          {submitted && (
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-400/15">
                <Check className="size-7 text-emerald-300" />
              </span>
              <DialogTitle className="font-display mt-4 text-xl">
                Application submitted
              </DialogTitle>
              <DialogDescription className="mt-2">
                Your application for {submitted.refName} was recorded in this
                prototype and now appears on your dashboard.
              </DialogDescription>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left text-xs">
                <p className="text-muted-foreground">
                  Application ID ·{" "}
                  <span className="font-mono text-foreground">
                    {submitted.id}
                  </span>
                </p>
                <p className="mt-1 text-muted-foreground">
                  Status · <span className="text-cyan-200">{submitted.status}</span>
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="gradient-button flex-1 border-0"
                  onClick={() => {
                    setSubmitted(null);
                    navigate("/dashboard");
                  }}
                >
                  Go to dashboard
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/15 bg-white/5"
                  onClick={() => setSubmitted(null)}
                >
                  Keep browsing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationDialog({
  scholarship,
  defaultName,
  defaultEmail,
  defaultPhone,
  defaultCollege,
  onClose,
  onSubmitted,
}: {
  scholarship: Scholarship | null;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultCollege: string;
  onClose: () => void;
  onSubmitted: (application: Application) => void;
}) {
  const store = useScholarStore();
  const student = getActiveStudent(store);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scholarship || !student) return;
    const data = new FormData(event.currentTarget);
    const statement = String(data.get("statement") ?? "").trim();
    if (statement.length < 30) {
      setError("Please write at least 30 characters about why you are a fit.");
      return;
    }
    setError(null);
    const application = applyForScholarship({
      studentId: student.id,
      scholarship,
      statement,
    });
    onSubmitted(application);
  };

  return (
    <Dialog
      open={Boolean(scholarship)}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="glass-deep max-h-[90vh] overflow-y-auto border-white/12 sm:max-w-lg">
        {scholarship && (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">
                Apply · {scholarship.name}
              </DialogTitle>
              <DialogDescription>
                {scholarship.organization} · closes{" "}
                {formatDeadline(scholarship.deadline)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="app-name" className="text-xs text-muted-foreground">
                  Full name
                </Label>
                <Input
                  id="app-name"
                  name="fullName"
                  required
                  defaultValue={defaultName}
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="app-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={defaultEmail}
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-phone" className="text-xs text-muted-foreground">
                  Phone
                </Label>
                <Input
                  id="app-phone"
                  name="phone"
                  required
                  defaultValue={defaultPhone}
                  placeholder="+91 98765 43210"
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="app-college" className="text-xs text-muted-foreground">
                  College
                </Label>
                <Input
                  id="app-college"
                  name="college"
                  required
                  defaultValue={defaultCollege}
                  className="h-10 rounded-xl border-white/12 bg-white/5"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label
                  htmlFor="app-statement"
                  className="text-xs text-muted-foreground"
                >
                  Why are you a good fit?
                </Label>
                <Textarea
                  id="app-statement"
                  name="statement"
                  required
                  rows={5}
                  placeholder="Describe your academics, projects and how this scholarship helps your goals…"
                  className="rounded-xl border-white/12 bg-white/5 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30"
                />
                <p className="text-[11px] text-muted-foreground/80">
                  Minimum 30 characters. Stored locally for this prototype.
                </p>
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
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-button border-0">
                Submit application
                <GraduationCap className="size-4" />
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
