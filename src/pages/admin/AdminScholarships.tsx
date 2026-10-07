import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  SCHOLARSHIP_CATEGORIES,
  SCHOLARSHIP_LEVELS,
  isExpired,
  type EducationLevel,
  type Scholarship,
  type ScholarshipCategory,
  type YearGroup,
} from "@/lib/scholar/data";
import {
  removeScholarship,
  saveScholarship,
  useScholarStore,
} from "@/lib/scholar/store";
import { cn } from "@/lib/utils";

const YEAR_GROUPS: (YearGroup | "Any")[] = [
  "Any",
  "1st year",
  "2nd year",
  "3rd year",
  "Final year",
];

type ScholarshipForm = {
  name: string;
  organization: string;
  category: ScholarshipCategory;
  level: EducationLevel;
  location: string;
  amount: string;
  duration: string;
  deadline: string;
  description: string;
  eligibility: string;
  benefits: string;
  branches: string;
  interests: string;
  yearGroups: YearGroup | "Any";
  needsBased: boolean;
};

function emptyForm(): ScholarshipForm {
  const inThirtyDays = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  return {
    name: "",
    organization: "",
    category: "Merit",
    level: "Undergraduate",
    location: "India",
    amount: "",
    duration: "1 year",
    deadline: inThirtyDays.toISOString().slice(0, 10),
    description: "",
    eligibility: "",
    benefits: "",
    branches: "Any",
    interests: "Any",
    yearGroups: "Any",
    needsBased: false,
  };
}

function formFrom(scholarship: Scholarship): ScholarshipForm {
  return {
    name: scholarship.name,
    organization: scholarship.organization,
    category: scholarship.category,
    level: scholarship.level,
    location: scholarship.location,
    amount: scholarship.amount,
    duration: scholarship.duration,
    deadline: scholarship.deadline,
    description: scholarship.description,
    eligibility: scholarship.eligibility,
    benefits: scholarship.benefits.join(", "),
    branches: scholarship.branches.join(", "),
    interests: scholarship.interests.join(", "),
    yearGroups: Array.isArray(scholarship.yearGroups)
      ? (scholarship.yearGroups[0] ?? "Any")
      : "Any",
    needsBased: scholarship.needsBased,
  };
}

function splitList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function formFieldClass(error?: boolean) {
  return cn(
    "h-11 w-full rounded-xl border-white/12 bg-white/5 text-sm focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30",
    error && "border-rose-400/60",
  );
}

export default function AdminScholarships() {
  const store = useScholarStore();
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScholarshipForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Scholarship | null>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const sorted = [...store.scholarships].sort((a, b) =>
      a.deadline.localeCompare(b.deadline),
    );
    if (!needle) return sorted;
    return sorted.filter((scholarship) =>
      [scholarship.name, scholarship.organization, scholarship.category]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [store.scholarships, query]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (scholarship: Scholarship) => {
    setEditingId(scholarship.id);
    setForm(formFrom(scholarship));
    setFormError(null);
    setEditorOpen(true);
  };

  const patch = (partial: Partial<ScholarshipForm>) =>
    setForm((current) => ({ ...current, ...partial }));

  const save = () => {
    if (!form.name.trim() || !form.organization.trim() || !form.deadline) {
      setFormError("Name, organisation and deadline are required.");
      return;
    }
    const scholarship: Scholarship = {
      id: editingId ?? `sch-${Date.now().toString(36)}`,
      name: form.name.trim(),
      organization: form.organization.trim(),
      category: form.category,
      level: form.level,
      location: form.location.trim() || "India",
      amount: form.amount.trim() || "—",
      duration: form.duration.trim() || "1 year",
      deadline: form.deadline,
      description: form.description.trim(),
      eligibility: form.eligibility.trim() || "Open to eligible students",
      benefits: splitList(form.benefits),
      branches: (() => {
        const list = splitList(form.branches);
        return list.length > 0 ? list : ["Any"];
      })(),
      interests: (() => {
        const list = splitList(form.interests);
        return list.length > 0 ? list : ["Any"];
      })(),
      yearGroups: form.yearGroups === "Any" ? "Any" : [form.yearGroups],
      needsBased: form.needsBased,
    };
    const result = saveScholarship(scholarship);
    if (result.ok) {
      toast.success(
        editingId
          ? `${scholarship.name} updated`
          : `${scholarship.name} added`,
      );
      setEditorOpen(false);
    } else {
      setFormError(result.error);
    }
  };

  const confirmRemove = () => {
    if (!removing) return;
    const result = removeScholarship(removing.id);
    if (result.ok) toast.success(`${removing.name} removed`);
    else toast.error(result.error);
    setRemoving(null);
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
            Admin · catalogue
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Scholarships
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The live catalogue behind every student dashboard. Add, edit or
            remove listings and the changes show up for students immediately.
          </p>
        </div>
        <Button className="gradient-button border-0" onClick={openAdd}>
          <Plus className="size-4" />
          Add scholarship
        </Button>
      </div>

      {/* search */}
      <div className="glass rounded-3xl p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, organisation or category…"
            className="h-11 rounded-xl border-white/12 bg-white/5 pl-10 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {results.length}
          </span>{" "}
          of {store.scholarships.length} scholarships
        </p>
      </div>

      {/* list */}
      {results.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
          <Search className="size-7 text-cyan-300" />
          <p className="font-medium">No scholarships match that search</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-white/15 bg-white/5"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
            <Button className="gradient-button border-0" onClick={openAdd}>
              <Plus className="size-4" />
              Add scholarship
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((scholarship) => {
            const expired = isExpired(scholarship.deadline);
            return (
              <Card
                key={scholarship.id}
                className="glass glass-hover rounded-3xl border-white/10"
              >
                <CardContent className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {scholarship.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-white/15 text-muted-foreground"
                      >
                        {scholarship.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/15 text-muted-foreground"
                      >
                        {scholarship.level}
                      </Badge>
                      {expired && (
                        <Badge
                          variant="outline"
                          className="border-rose-300/40 bg-rose-400/10 text-rose-200"
                        >
                          Closed
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {scholarship.organization} · {scholarship.amount} ·{" "}
                      {scholarship.location} · closes {scholarship.deadline}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-cyan-400/50 hover:text-cyan-200"
                      onClick={() => openEdit(scholarship)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-white/5 hover:border-rose-400/40 hover:text-rose-200"
                      onClick={() => setRemoving(scholarship)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* add / edit dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? "Edit scholarship" : "Add scholarship"}
            </DialogTitle>
            <DialogDescription>
              Fields marked required are validated before saving. Students see
              the updated listing right away.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sch-name" className="text-xs text-muted-foreground">
                Name *
              </Label>
              <Input
                id="sch-name"
                value={form.name}
                onChange={(event) => patch({ name: event.target.value })}
                placeholder="Future Founders Scholarship"
                className={formFieldClass(Boolean(formError && !form.name.trim()))}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-org"
                className="text-xs text-muted-foreground"
              >
                Organisation *
              </Label>
              <Input
                id="sch-org"
                value={form.organization}
                onChange={(event) => patch({ organization: event.target.value })}
                placeholder="NovaTech Foundation"
                className={formFieldClass(
                  Boolean(formError && !form.organization.trim()),
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-location"
                className="text-xs text-muted-foreground"
              >
                Location
              </Label>
              <Input
                id="sch-location"
                value={form.location}
                onChange={(event) => patch({ location: event.target.value })}
                placeholder="India"
                className={formFieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  patch({ category: value as ScholarshipCategory })
                }
              >
                <SelectTrigger className={formFieldClass()}>
                  <SelectValue>
                    {SCHOLARSHIP_CATEGORIES.includes(form.category)
                      ? form.category
                      : "Merit"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-white/12 bg-[#0b1130]">
                  {SCHOLARSHIP_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Education level
              </Label>
              <Select
                value={form.level}
                onValueChange={(value) =>
                  patch({ level: value as EducationLevel })
                }
              >
                <SelectTrigger className={formFieldClass()}>
                  <SelectValue>{form.level}</SelectValue>
                </SelectTrigger>
                <SelectContent className="border-white/12 bg-[#0b1130]">
                  {SCHOLARSHIP_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-amount"
                className="text-xs text-muted-foreground"
              >
                Amount
              </Label>
              <Input
                id="sch-amount"
                value={form.amount}
                onChange={(event) => patch({ amount: event.target.value })}
                placeholder="₹1,00,000"
                className={formFieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-duration"
                className="text-xs text-muted-foreground"
              >
                Duration
              </Label>
              <Input
                id="sch-duration"
                value={form.duration}
                onChange={(event) => patch({ duration: event.target.value })}
                placeholder="1 year"
                className={formFieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-deadline"
                className="text-xs text-muted-foreground"
              >
                Deadline *
              </Label>
              <Input
                id="sch-deadline"
                type="date"
                value={form.deadline}
                onChange={(event) => patch({ deadline: event.target.value })}
                className={formFieldClass(Boolean(formError && !form.deadline))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Year groups
              </Label>
              <Select
                value={form.yearGroups}
                onValueChange={(value) =>
                  patch({ yearGroups: value as YearGroup | "Any" })
                }
              >
                <SelectTrigger className={formFieldClass()}>
                  <SelectValue>{form.yearGroups}</SelectValue>
                </SelectTrigger>
                <SelectContent className="border-white/12 bg-[#0b1130]">
                  {YEAR_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group === "Any" ? "All years" : group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-eligibility"
                className="text-xs text-muted-foreground"
              >
                Eligibility
              </Label>
              <Input
                id="sch-eligibility"
                value={form.eligibility}
                onChange={(event) =>
                  patch({ eligibility: event.target.value })
                }
                placeholder="CSE students with a 7.5 CGPA"
                className={formFieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Need-based support
              </Label>
              <Select
                value={form.needsBased ? "yes" : "no"}
                onValueChange={(value) => patch({ needsBased: value === "yes" })}
              >
                <SelectTrigger className={formFieldClass()}>
                  <SelectValue>{form.needsBased ? "Yes" : "No"}</SelectValue>
                </SelectTrigger>
                <SelectContent className="border-white/12 bg-[#0b1130]">
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="sch-description"
                className="text-xs text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="sch-description"
                value={form.description}
                onChange={(event) => patch({ description: event.target.value })}
                rows={3}
                placeholder="What the scholarship covers and who it is for…"
                className="rounded-xl border-white/12 bg-white/5 text-sm focus-visible:border-cyan-400/60 focus-visible:ring-cyan-400/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-benefits"
                className="text-xs text-muted-foreground"
              >
                Benefits (comma separated)
              </Label>
              <Input
                id="sch-benefits"
                value={form.benefits}
                onChange={(event) => patch({ benefits: event.target.value })}
                placeholder="Tuition cover, Mentorship, Laptop"
                className={formFieldClass()}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="sch-branches"
                className="text-xs text-muted-foreground"
              >
                Branches (comma separated, or Any)
              </Label>
              <Input
                id="sch-branches"
                value={form.branches}
                onChange={(event) => patch({ branches: event.target.value })}
                placeholder="Any"
                className={formFieldClass()}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="sch-interests"
                className="text-xs text-muted-foreground"
              >
                Career interests (comma separated, or Any)
              </Label>
              <Input
                id="sch-interests"
                value={form.interests}
                onChange={(event) => patch({ interests: event.target.value })}
                placeholder="Any"
                className={formFieldClass()}
              />
            </div>
          </div>

          {formError && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {formError}
            </p>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="border-white/15 bg-white/5"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button className="gradient-button border-0" onClick={save}>
              {editingId ? "Save changes" : "Add scholarship"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete confirmation */}
      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The listing is removed from the catalogue for every student.
              Existing application records keep the scholarship name. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>
              Delete scholarship
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
