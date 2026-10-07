import { useMemo, useState } from "react";
import { Search, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  applicationsFor,
  getActiveStudent,
  removeStudent,
  setStudentRole,
  statusTone,
  useScholarStore,
  type Student,
} from "@/lib/scholar/store";

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm break-words">{value || "—"}</p>
    </div>
  );
}

export default function AdminStudents() {
  const store = useScholarStore();
  const me = getActiveStudent(store);
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Student | null>(null);
  const [removing, setRemoving] = useState<Student | null>(null);

  const admins = store.students.filter((s) => s.role === "admin").length;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sorted = [...store.students].sort((a, b) => {
      if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
    if (!needle) return sorted;
    return sorted.filter((student) =>
      [student.fullName, student.email, student.college, student.branch]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [store.students, query]);

  const toggleRole = (student: Student) => {
    const next = student.role === "admin" ? "student" : "admin";
    const result = setStudentRole(student.id, next);
    if (result.ok) {
      toast.success(
        next === "admin"
          ? `${student.fullName} is now an admin`
          : `${student.fullName} is now a student`,
      );
      setViewing((current) =>
        current && current.id === student.id
          ? { ...current, role: next }
          : current,
      );
    } else {
      toast.error(result.error);
    }
  };

  const confirmRemove = () => {
    if (!removing) return;
    const result = removeStudent(removing.id);
    if (result.ok) {
      toast.success(`${removing.fullName} removed`);
      setViewing((current) =>
        current && current.id === removing.id ? null : current,
      );
    } else {
      toast.error(result.error);
    }
    setRemoving(null);
  };

  const viewingApplications = viewing
    ? applicationsFor(store, viewing.id)
    : [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
            Admin · accounts
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Students
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every account registered in this browser. Open a profile to inspect
            it, grant admin access, or remove an account and its applications.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="border-white/15 text-muted-foreground"
          >
            {store.students.length - admins} students
          </Badge>
          <Badge
            variant="outline"
            className="border-violet-300/40 bg-violet-400/10 text-violet-200"
          >
            {admins} admins
          </Badge>
        </div>
      </div>

      {/* search */}
      <div className="glass rounded-3xl p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, college or branch…"
            className="h-11 rounded-xl border-white/12 bg-white/5 pl-10 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {results.length}
          </span>{" "}
          of {store.students.length} accounts
        </p>
      </div>

      {/* list */}
      {results.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
          <Users className="size-7 text-cyan-300" />
          <p className="font-medium">No accounts match that search</p>
          <Button
            variant="outline"
            className="border-white/15 bg-white/5"
            onClick={() => setQuery("")}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((student) => {
            const isSelf = student.id === me?.id;
            const count = applicationsFor(store, student.id).length;
            return (
              <Card
                key={student.id}
                className="glass glass-hover rounded-3xl border-white/10"
              >
                <CardContent className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-[#04121c]">
                    {initials(student.fullName) || "U"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {student.fullName}
                      </p>
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
                      {isSelf && (
                        <Badge
                          variant="outline"
                          className="border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {student.email} · {student.college || "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground/80">
                      {student.degree} · {student.branch} · batch{" "}
                      {student.gradYear} · {count} application
                      {count === 1 ? "" : "s"} · joined{" "}
                      {formatDate(student.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5"
                      onClick={() => setViewing(student)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-violet-400/50 hover:text-violet-200"
                      disabled={isSelf}
                      onClick={() => toggleRole(student)}
                    >
                      <ShieldCheck className="size-3.5" />
                      {student.role === "admin"
                        ? "Make student"
                        : "Make admin"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-rose-400/40 hover:text-rose-200"
                      disabled={isSelf}
                      onClick={() => setRemoving(student)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* view dialog */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {viewing.fullName}
                </DialogTitle>
                <DialogDescription>
                  {viewing.role === "admin"
                    ? "Administrator account"
                    : "Student account"}{" "}
                  · joined {formatDate(viewing.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Email" value={viewing.email} />
                <Detail label="Phone" value={viewing.phone} />
                <Detail label="College" value={viewing.college} />
                <Detail label="Degree" value={viewing.degree} />
                <Detail label="Branch" value={viewing.branch} />
                <Detail label="Graduation year" value={viewing.gradYear} />
                <Detail label="Career interest" value={viewing.careerInterest} />
                <Detail label="Portfolio" value={viewing.portfolio} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewing.skills.length > 0 ? (
                    viewing.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="border-white/15 text-foreground"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">None listed</p>
                  )}
                </div>
              </div>

              {viewing.bio && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Headline
                  </p>
                  <p className="mt-1 text-sm">{viewing.bio}</p>
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Applications ({viewingApplications.length})
                </p>
                <div className="mt-2 space-y-2">
                  {viewingApplications.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nothing submitted yet.
                    </p>
                  )}
                  {viewingApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {application.refName}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusTone(application.status)}
                      >
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 hover:border-violet-400/50 hover:text-violet-200"
                  disabled={viewing.id === me?.id}
                  onClick={() => toggleRole(viewing)}
                >
                  <ShieldCheck className="size-4" />
                  {viewing.role === "admin"
                    ? "Make student"
                    : "Make admin"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 hover:border-rose-400/40 hover:text-rose-200"
                  disabled={viewing.id === me?.id}
                  onClick={() => setRemoving(viewing)}
                >
                  <Trash2 className="size-4" />
                  Remove account
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* remove confirmation */}
      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {removing?.fullName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the account
              {removing &&
                ` and its ${applicationsFor(store, removing.id).length} application(s)`}{" "}
              from this browser. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
              Remove account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
