import { useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { BrandLockup } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import {
  getActiveStudent,
  profileCompletion,
  signOutStudent,
  useScholarStore,
} from "@/lib/scholar/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboard/scholarships",
    label: "Scholarships",
    icon: GraduationCap,
    end: false,
  },
  {
    to: "/dashboard/profile",
    label: "Profile",
    icon: UserIcon,
    end: false,
  },
];

function navClass(isActive: boolean) {
  return cn(
    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
    isActive
      ? "bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-foreground shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]"
      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) => navClass(isActive)}
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/scholarships": "Scholarships",
  "/dashboard/profile": "Profile",
};

export default function Dashboard() {
  const store = useScholarStore();
  const student = getActiveStudent(store);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    signOutStudent();
    setSheetOpen(false);
    try {
      await signOut();
    } catch {
      /* no platform session to clear */
    }
    navigate("/");
  };

  if (!student) {
    /* Defensive only — RequireStudent keeps this route session-gated. */
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="glass flex max-w-md flex-col items-center gap-4 rounded-3xl p-8 text-center">
          <Sparkles className="size-6 text-cyan-300" />
          <p className="text-sm text-muted-foreground">
            Your Scholar AI session ended. Sign in again to open your
            dashboard.
          </p>
          <Button
            className="gradient-button border-0"
            onClick={() => navigate("/auth?returnTo=%2Fdashboard")}
          >
            Sign in
          </Button>
        </div>
      </main>
    );
  }

  const completion = profileCompletion(student);
  const title = PAGE_TITLES[location.pathname] ?? "Scholar AI";

  return (
    <div className="relative min-h-screen">
      {/* ambient background */}
      <div className="starfield pointer-events-none fixed inset-0 opacity-40" />
      <div className="orb pointer-events-none fixed -top-32 left-1/4 size-96 bg-cyan-500/20" />
      <div className="orb pointer-events-none fixed right-[-8%] bottom-[-10%] size-[420px] bg-violet-600/20" />

      {/* sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/8 bg-[#070b24]/90 backdrop-blur-xl lg:flex">
        <div className="px-5 pt-6 pb-5">
          <BrandLockup onClick={() => navigate("/dashboard")} />
        </div>

        <div className="px-5 pb-3">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Student workspace
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <NavList />
        </div>

        <div className="space-y-3 border-t border-white/8 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profile strength</span>
              <span className="font-semibold text-cyan-300">
                {completion.percent}%
              </span>
            </div>
            <Progress
              value={completion.percent}
              className="mt-2 h-1.5 bg-white/10"
            />
            <button
              type="button"
              onClick={() => navigate("/dashboard/profile")}
              className="mt-2 text-[11px] text-muted-foreground transition-colors hover:text-cyan-300"
            >
              {completion.missing.length > 0
                ? `Add ${completion.missing[0].toLowerCase()} to improve`
                : "Profile looks complete"}
            </button>
          </div>

          <div className="flex items-center gap-3 px-1">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-bold text-[#04121c]">
              {initials(student.fullName) || "S"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{student.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {student.branch} · {student.gradYear}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-white/12 bg-white/5 text-muted-foreground hover:border-rose-400/40 hover:text-rose-200"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* main column */}
      <div className="relative lg:pl-64">
        {/* top bar */}
        <header className="sticky top-0 z-20 border-b border-white/8 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/12 bg-white/5 lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-white/10 bg-[#070b24]"
                >
                  <SheetHeader className="px-2 pr-12 pb-2">
                    <SheetTitle>
                      <BrandLockup onClick={() => {
                        setSheetOpen(false);
                        navigate("/dashboard");
                      }} />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 space-y-6 px-2">
                    <NavList onNavigate={() => setSheetOpen(false)} />
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Profile strength
                        </span>
                        <span className="font-semibold text-cyan-300">
                          {completion.percent}%
                        </span>
                      </div>
                      <Progress
                        value={completion.percent}
                        className="mt-2 h-1.5 bg-white/10"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-white/12 bg-white/5 text-muted-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                </SheetContent>
              </Sheet>

              <span className="font-display text-base font-semibold tracking-tight">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground sm:inline">
                Prototype · demo data
              </span>
              <button
                type="button"
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-1 transition-colors hover:border-cyan-400/40"
              >
                <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[10px] font-bold text-[#04121c]">
                  {initials(student.fullName) || "S"}
                </span>
                <span className="hidden max-w-[120px] truncate text-xs font-medium sm:inline">
                  {student.fullName}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-rose-200 lg:hidden"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
