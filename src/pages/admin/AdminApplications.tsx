import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Search, Undo2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  setApplicationStatus,
  statusTone,
  useScholarStore,
  type Application,
} from "@/lib/scholar/store";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "Submitted", label: "Submitted" },
  { value: "Under review", label: "Under review" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
] as const;

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export default function AdminApplications() {
  const store = useScholarStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [viewing, setViewing] = useState<Application | null>(null);

  const studentById = useMemo(
    () => new Map(store.students.map((student) => [student.id, student])),
    [store.students],
  );

  const nameFor = (studentId: string) =>
    studentById.get(studentId)?.fullName ?? "Removed student";
  const emailFor = (studentId: string) =>
    studentById.get(studentId)?.email ?? "—";

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...store.applications]
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .filter((application) => {
        if (status !== "all" && application.status !== status) return false;
        if (!needle) return true;
        const student = studentById.get(application.studentId);
        return [
          student?.fullName ?? "",
          student?.email ?? "",
          application.refName,
          application.organization,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      });
  }, [store.applications, studentById, query, status]);

  const update = (application: Application, next: Application["status"]) => {
    const result = setApplicationStatus(application.id, next);
    if (result.ok) {
      toast.success(`${application.refName} → ${next}`);
      setViewing((current) =>
        current && current.id === application.id
          ? { ...current, status: next }
          : current,
      );
    } else {
      toast.error(result.error);
    }
  };

  const counts = {
    Submitted: store.applications.filter((a) => a.status === "Submitted")
      .length,
    "Under review": store.applications.filter(
      (a) => a.status === "Under review",
    ).length,
    Approved: store.applications.filter((a) => a.status === "Approved")
      .length,
    Rejected: store.applications.filter((a) => a.status === "Rejected")
      .length,
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
            Admin · review queue
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Applications
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every scholarship application submitted by students. Read the
            statement, then approve, reject or send it under review — students
            see the new status on their dashboard instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="border-amber-300/40 bg-amber-400/10 text-amber-200"
          >
            {counts.Submitted + counts["Under review"]} pending
          </Badge>
          <Badge
            variant="outline"
            className="border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
          >
            {counts.Approved} approved
          </Badge>
          <Badge
            variant="outline"
            className="border-rose-300/40 bg-rose-400/10 text-rose-200"
          >
            {counts.Rejected} rejected
          </Badge>
        </div>
      </div>

      {/* filters */}
      <div className="glass rounded-3xl p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by student or scholarship…"
              className="h-11 rounded-xl border-white/12 bg-white/5 pl-10 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-full border-white/12 bg-white/5">
              <SelectValue placeholder="All statuses">
                {STATUS_FILTERS.find((f) => f.value === status)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/12 bg-[#0b1130]">
              {STATUS_FILTERS.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {results.length}
          </span>{" "}
          of {store.applications.length} applications
        </p>
      </div>

      {/* list */}
      {results.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
          <CheckCircle2 className="size-7 text-cyan-300" />
          <p className="font-medium">
            {store.applications.length === 0
              ? "No applications yet"
              : "Nothing matches these filters"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {store.applications.length === 0
              ? "Applications submitted by students will appear here for review."
              : "Try another status or clear the search."}
          </p>
          {store.applications.length > 0 && (
            <Button
              variant="outline"
              className="border-white/15 bg-white/5"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((application) => (
            <Card
              key={application.id}
              className="glass glass-hover rounded-3xl border-white/10"
            >
              <CardContent className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {nameFor(application.studentId)}
                      </p>
                      <Badge
                        variant="outline"
                        className={statusTone(application.status)}
                      >
                        {application.status}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {application.refName} · {application.organization}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {emailFor(application.studentId)} · submitted{" "}
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5"
                      onClick={() => setViewing(application)}
                    >
                      <Eye className="size-3.5" />
                      View statement
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-amber-400/50 hover:text-amber-200"
                      disabled={application.status === "Under review"}
                      onClick={() => update(application, "Under review")}
                    >
                      <Undo2 className="size-3.5" />
                      Under review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-emerald-400/50 hover:text-emerald-200"
                      disabled={application.status === "Approved"}
                      onClick={() => update(application, "Approved")}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-rose-400/40 hover:text-rose-200"
                      disabled={application.status === "Rejected"}
                      onClick={() => update(application, "Rejected")}
                    >
                      <XCircle className="size-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>

                <p className="line-clamp-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-muted-foreground">
                  “{application.statement}”
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* statement dialog */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {viewing.refName}
                </DialogTitle>
                <DialogDescription>
                  {nameFor(viewing.studentId)} · {emailFor(viewing.studentId)}{" "}
                  · submitted {formatDate(viewing.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className={statusTone(viewing.status)}>
                  {viewing.status}
                </Badge>
                <span className="text-muted-foreground">
                  · {viewing.organization}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Statement
                </p>
                <p className="mt-1.5 text-sm whitespace-pre-wrap">
                  {viewing.statement}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 bg-white/5 hover:border-amber-400/50 hover:text-amber-200"
                  disabled={viewing.status === "Under review"}
                  onClick={() => update(viewing, "Under review")}
                >
                  Under review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 bg-white/5 hover:border-emerald-400/50 hover:text-emerald-200"
                  disabled={viewing.status === "Approved"}
                  onClick={() => update(viewing, "Approved")}
                >
                  <CheckCircle2 className="size-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/15 bg-white/5 hover:border-rose-400/40 hover:text-rose-200"
                  disabled={viewing.status === "Rejected"}
                  onClick={() => update(viewing, "Rejected")}
                >
                  <XCircle className="size-3.5" />
                  Reject
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
