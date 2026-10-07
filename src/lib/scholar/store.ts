/**
 * Scholar AI prototype store.
 *
 * A tiny observable store persisted to localStorage. It backs every working
 * interaction in the prototype — registration, sign-in, profile editing and
 * scholarship applications — so state survives reloads without a backend.
 * Swap `readState` / `writeState` for Convex (or any API) calls later and the
 * components keep working unchanged.
 */
import { useSyncExternalStore } from "react";
import {
  SCHOLARSHIPS,
  isExpired,
  scholarshipMatchesProfile,
  matchScore,
  type ProfileLike,
  type Scholarship,
} from "./data";

const STORAGE_KEY = "scholarai.v1.state";

export type Role = "student" | "admin";

export type Student = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  /** Prototype-only credential stored locally — never sent anywhere. */
  password: string;
  /** "admin" unlocks the /admin workspace. Defaults to "student". */
  role: Role;
  college: string;
  degree: string;
  branch: string;
  gradYear: string;
  skills: string[];
  careerInterest: string;
  bio: string;
  portfolio: string;
  demo?: boolean;
  createdAt: number;
};

export type Application = {
  id: string;
  studentId: string;
  kind: "scholarship";
  refId: string;
  refName: string;
  organization: string;
  submittedAt: number;
  status: "Submitted" | "Under review" | "Approved" | "Rejected";
  statement: string;
};

export type StoreState = {
  students: Student[];
  activeId: string | null;
  applications: Application[];
  /** Mutable catalogue: seeded from the demo data, managed by the admin. */
  scholarships: Scholarship[];
};

/** Badge tone for an application status (shared by student + admin UIs). */
export function statusTone(status: Application["status"]): string {
  switch (status) {
    case "Under review":
      return "border-amber-300/30 bg-amber-400/10 text-amber-200";
    case "Approved":
      return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
    case "Rejected":
      return "border-rose-300/30 bg-rose-400/10 text-rose-200";
    default:
      return "border-cyan-300/30 bg-cyan-400/10 text-cyan-200";
  }
}

export type RegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  college: string;
  degree: string;
  branch: string;
  gradYear: string;
  skills: string;
  careerInterest: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

/* ---------------------------------------------------------------- */
/* Seed                                                              */
/* ---------------------------------------------------------------- */

function uid(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

export const DEMO_CREDENTIALS = {
  email: "jayanth@scholar.ai",
  password: "demo1234",
};

/** Sign-in for the admin workspace at /admin. */
export const ADMIN_CREDENTIALS = {
  email: "admin@scholar.ai",
  password: "admin1234",
};

export function isAdmin(student: Student | null | undefined): boolean {
  return student?.role === "admin";
}

function seedAdmin(): Student {
  return {
    id: "user-admin-scholarai",
    fullName: "Scholar AI Admin",
    email: ADMIN_CREDENTIALS.email,
    phone: "+91 90000 00000",
    password: ADMIN_CREDENTIALS.password,
    college: "Scholar AI",
    degree: "B.Tech",
    branch: "Other",
    gradYear: "2027",
    skills: ["Operations", "Review", "Analytics"],
    careerInterest: "Software Development",
    bio: "Platform administrator for the Scholar AI prototype — reviews applications and manages the opportunity catalogue.",
    portfolio: "",
    demo: true,
    role: "admin",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  };
}

function seedState(): StoreState {
  const demoStudent: Student = {
    id: "student-demo-jayanth",
    fullName: "Jayanth Kumar",
    email: DEMO_CREDENTIALS.email,
    phone: "+91 98765 43210",
    password: DEMO_CREDENTIALS.password,
    role: "student",
    college: "Sri Venkateswara Institute of Technology",
    degree: "B.Tech",
    branch: "CSE",
    gradYear: "2027",
    skills: ["React", "Python", "SQL", "Git", "Figma"],
    careerInterest: "Software Development",
    bio: "Final-year CSE student who ships full-stack side projects and mentors first-years in web development.",
    portfolio: "",
    demo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 21,
  };

  const now = Date.now();
  const demoApplications: Application[] = [
    {
      id: uid("app"),
      studentId: demoStudent.id,
      kind: "scholarship",
      refId: "sch-novatech-coders",
      refName: "NovaTech Future Coders Scholarship",
      organization: "NovaTech Foundation",
      submittedAt: now - 1000 * 60 * 60 * 24 * 6,
      status: "Under review",
      statement:
        "I have shipped three full-stack projects and mentor juniors in React — this grant would fund my final-year capstone.",
    },
    {
      id: uid("app"),
      studentId: demoStudent.id,
      kind: "scholarship",
      refId: "sch-women-stem",
      refName: "Women in STEM Leaders Grant",
      organization: "Astra Learning Labs",
      submittedAt: now - 1000 * 60 * 60 * 24 * 2,
      status: "Submitted",
      statement:
        "I run our campus coding club and organised a 40-hour intro to programming workshop for first-years.",
    },
  ];

  return {
    students: [seedAdmin(), demoStudent],
    activeId: null,
    applications: demoApplications,
    scholarships: [...SCHOLARSHIPS],
  };
}

/* ---------------------------------------------------------------- */
/* Persistence + subscription                                        */
/* ---------------------------------------------------------------- */

function readState(): StoreState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    /* Backfill state saved before roles / the admin account / scholarships
       existed, so installs from earlier sessions gain the admin cleanly. */
    const students = (
      Array.isArray(parsed.students) ? parsed.students : []
    ).map((student): Student => ({
      ...student,
      role: student.role === "admin" ? "admin" : "student",
    }));
    if (!students.some((student) => student.role === "admin")) {
      students.unshift(seedAdmin());
    }
    return {
      students,
      activeId: typeof parsed.activeId === "string" ? parsed.activeId : null,
      applications: Array.isArray(parsed.applications)
        ? parsed.applications
        : [],
      scholarships: Array.isArray(parsed.scholarships)
        ? parsed.scholarships
        : [...SCHOLARSHIPS],
    };
  } catch {
    return seedState();
  }
}

function writeState(next: StoreState) {
  state = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* storage unavailable — keep the in-memory session for this page view */
  }
  listeners.forEach((listener) => listener());
}

let state: StoreState = readState();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StoreState {
  return state;
}

export function useScholarStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getActiveStudent(store: StoreState = state): Student | null {
  if (!store.activeId) return null;
  return store.students.find((s) => s.id === store.activeId) ?? null;
}

/** Read-only snapshot for non-React consumers (tests, future AI actions). */
export function getStoreState(): StoreState {
  return state;
}

/* ---------------------------------------------------------------- */
/* Auth actions                                                      */
/* ---------------------------------------------------------------- */

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseSkills(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  );
}

export function registerStudent(input: RegistrationInput): ActionResult {
  const email = normalizeEmail(input.email);
  if (state.students.some((s) => s.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const student: Student = {
    id: uid("student"),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    password: input.password,
    college: input.college.trim(),
    degree: input.degree,
    branch: input.branch,
    gradYear: input.gradYear,
    skills: parseSkills(input.skills),
    careerInterest: input.careerInterest,
    bio: "",
    portfolio: "",
    role: "student",
    createdAt: Date.now(),
  };
  writeState({
    ...state,
    students: [...state.students, student],
    activeId: student.id,
  });
  return { ok: true };
}

export function signInStudent(email: string, password: string): ActionResult {
  const normalized = normalizeEmail(email);
  const student = state.students.find((s) => s.email === normalized);
  if (!student) {
    return { ok: false, error: "No account found for that email address." };
  }
  if (student.password !== password) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }
  writeState({ ...state, activeId: student.id });
  return { ok: true };
}

export function resetStudentPassword(
  email: string,
  newPassword: string,
): ActionResult {
  const normalized = normalizeEmail(email);
  const student = state.students.find((s) => s.email === normalized);
  if (!student) {
    return { ok: false, error: "No account found for that email address." };
  }
  writeState({
    ...state,
    students: state.students.map((s) =>
      s.id === student.id ? { ...s, password: newPassword } : s,
    ),
  });
  return { ok: true };
}

export function signOutStudent() {
  writeState({ ...state, activeId: null });
}

export function updateStudent(studentId: string, patch: Partial<Student>) {
  writeState({
    ...state,
    students: state.students.map((s) =>
      s.id === studentId ? { ...s, ...patch } : s,
    ),
  });
}

export function updateSkills(studentId: string, rawSkills: string) {
  updateStudent(studentId, { skills: parseSkills(rawSkills) });
}

export function setStudentRole(studentId: string, role: Role): ActionResult {
  if (state.activeId === studentId && role !== "admin") {
    return {
      ok: false,
      error: "You can't remove admin from the account you're signed in as.",
    };
  }
  if (!state.students.some((s) => s.id === studentId)) {
    return { ok: false, error: "Account not found." };
  }
  writeState({
    ...state,
    students: state.students.map((s) =>
      s.id === studentId ? { ...s, role } : s,
    ),
  });
  return { ok: true };
}

/** Removes an account and everything it submitted. */
export function removeStudent(studentId: string): ActionResult {
  if (state.activeId === studentId) {
    return {
      ok: false,
      error: "You can't remove the account you're signed in as.",
    };
  }
  if (!state.students.some((s) => s.id === studentId)) {
    return { ok: false, error: "Account not found." };
  }
  writeState({
    ...state,
    students: state.students.filter((s) => s.id !== studentId),
    applications: state.applications.filter(
      (application) => application.studentId !== studentId,
    ),
  });
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Applications                                                      */
/* ---------------------------------------------------------------- */

export function applyForScholarship(input: {
  studentId: string;
  scholarship: Scholarship;
  statement: string;
}): Application {
  const application: Application = {
    id: uid("app"),
    studentId: input.studentId,
    kind: "scholarship",
    refId: input.scholarship.id,
    refName: input.scholarship.name,
    organization: input.scholarship.organization,
    submittedAt: Date.now(),
    status: "Submitted",
    statement: input.statement,
  };
  writeState({
    ...state,
    applications: [application, ...state.applications],
  });
  return application;
}

export function applicationsFor(
  store: StoreState,
  studentId: string | null | undefined,
): Application[] {
  if (!studentId) return [];
  return store.applications
    .filter((application) => application.studentId === studentId)
    .sort((a, b) => b.submittedAt - a.submittedAt);
}

export function setApplicationStatus(
  applicationId: string,
  status: Application["status"],
): ActionResult {
  if (!state.applications.some((a) => a.id === applicationId)) {
    return { ok: false, error: "Application not found." };
  }
  writeState({
    ...state,
    applications: state.applications.map((application) =>
      application.id === applicationId ? { ...application, status } : application,
    ),
  });
  return { ok: true };
}

/* ---------------------------------------------------------------- */
/* Admin — scholarship catalogue                                     */
/* ---------------------------------------------------------------- */

/** Adds a scholarship or overwrites the one with the same id. */
export function saveScholarship(scholarship: Scholarship): ActionResult {
  const exists = state.scholarships.some((s) => s.id === scholarship.id);
  writeState({
    ...state,
    scholarships: exists
      ? state.scholarships.map((s) =>
          s.id === scholarship.id ? scholarship : s,
        )
      : [...state.scholarships, scholarship],
  });
  return { ok: true };
}

export function removeScholarship(scholarshipId: string): ActionResult {
  if (!state.scholarships.some((s) => s.id === scholarshipId)) {
    return { ok: false, error: "Scholarship not found." };
  }
  writeState({
    ...state,
    scholarships: state.scholarships.filter((s) => s.id !== scholarshipId),
  });
  return { ok: true };
}

export function hasApplied(
  store: StoreState,
  studentId: string | null | undefined,
  scholarshipId: string,
): boolean {
  if (!studentId) return false;
  return store.applications.some(
    (application) =>
      application.studentId === studentId &&
      application.refId === scholarshipId,
  );
}

/* ---------------------------------------------------------------- */
/* Selectors                                                         */
/* ---------------------------------------------------------------- */

export type ProfileCompletion = {
  percent: number;
  missing: string[];
};

/**
 * Profile strength: the 10 registration fields are worth 8 pts each (80),
 * an optional headline bio 10 and a portfolio link 10.
 */
export function profileCompletion(student: Student | null): ProfileCompletion {
  if (!student) return { percent: 0, missing: [] };
  const checks: { label: string; filled: boolean }[] = [
    { label: "Full name", filled: Boolean(student.fullName) },
    { label: "Email", filled: Boolean(student.email) },
    { label: "Phone", filled: Boolean(student.phone) },
    { label: "College", filled: Boolean(student.college) },
    { label: "Degree", filled: Boolean(student.degree) },
    { label: "Branch", filled: Boolean(student.branch) },
    { label: "Graduation year", filled: Boolean(student.gradYear) },
    { label: "Skills", filled: student.skills.length > 0 },
    { label: "Career interest", filled: Boolean(student.careerInterest) },
    { label: "Account password", filled: Boolean(student.password) },
    { label: "Profile headline", filled: Boolean(student.bio) },
    { label: "Portfolio link", filled: Boolean(student.portfolio) },
  ];
  const filled = checks.filter((check) => check.filled);
  const missing = checks.filter((check) => !check.filled).map((c) => c.label);
  return {
    percent: Math.round((filled.length / checks.length) * 100),
    missing,
  };
}

/** Scholarships ranked for this student — profile matches first. */
export function recommendedScholarships(
  student: ProfileLike | null,
  limit?: number,
): Scholarship[] {
  const ranked = state.scholarships.filter(
    (scholarship) => !isExpired(scholarship.deadline),
  )
    .map((scholarship) => ({
      scholarship,
      matches: student ? scholarshipMatchesProfile(scholarship, student) : false,
      score: student ? matchScore(scholarship, student) : 0,
    }))
    .sort((a, b) => {
      if (a.matches !== b.matches) return a.matches ? -1 : 1;
      return b.score - a.score;
    });
  const list = ranked.map((entry) => entry.scholarship);
  return limit ? list.slice(0, limit) : list;
}
