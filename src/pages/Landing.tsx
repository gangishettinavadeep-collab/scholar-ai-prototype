import { useMemo, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Award,
  Bot,
  BookOpen,
  Briefcase,
  Building2,
  Check,
  Clock,
  Compass,
  FolderKanban,
  GraduationCap,
  Rocket,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { BrandMark, BrandLockup } from "@/components/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEMO_DATA_NOTICE,
  formatDeadline,
  type Scholarship,
} from "@/lib/scholar/data";
import { getActiveStudent, useScholarStore } from "@/lib/scholar/store";
import { cn } from "@/lib/utils";

const TAGLINE = ["Learn", "Earn", "Experience", "Get Certified", "Get Hired"];

type Floater = {
  label: string;
  meta: string;
  icon: LucideIcon;
  position: string;
  tilt: number;
  delay: string;
  accent: string;
};

const FLOATERS: Floater[] = [
  {
    label: "Scholarship",
    meta: "₹1,50,000 grant",
    icon: GraduationCap,
    position: "left-[-2%] top-[4%]",
    tilt: -5,
    delay: "",
    accent: "text-cyan-300",
  },
  {
    label: "Internship",
    meta: "Remote · 3 months",
    icon: Briefcase,
    position: "right-[-4%] top-[20%]",
    tilt: 6,
    delay: "anim-delay-1",
    accent: "text-sky-300",
  },
  {
    label: "Course",
    meta: "6 modules · progress",
    icon: BookOpen,
    position: "left-[0%] top-[46%]",
    tilt: 4,
    delay: "anim-delay-2",
    accent: "text-violet-300",
  },
  {
    label: "Certificate",
    meta: "Verified badge",
    icon: Award,
    position: "right-[2%] bottom-[24%]",
    tilt: -6,
    delay: "anim-delay-3",
    accent: "text-fuchsia-300",
  },
  {
    label: "Job",
    meta: "Full time · hybrid",
    icon: Building2,
    position: "left-[6%] bottom-[1%]",
    tilt: 5,
    delay: "anim-delay-4",
    accent: "text-emerald-300",
  },
];

type Pillar = {
  icon: LucideIcon;
  title: string;
  text: string;
  live?: boolean;
};

const PILLARS: Pillar[] = [
  {
    icon: GraduationCap,
    title: "Scholarships",
    text: "Discover grants by category, education level, location and eligibility, then apply without leaving the platform.",
    live: true,
  },
  {
    icon: BookOpen,
    title: "Online Learning",
    text: "Courses built from modules and lessons with progress tracking, so your learning shows up on your profile.",
  },
  {
    icon: Briefcase,
    title: "Internships",
    text: "Skill-matched internships with duration, work mode and stipend — an application flow that tracks itself.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    text: "Portfolio projects that turn coursework into proof of work, the thing recruiters actually ask for.",
  },
  {
    icon: Award,
    title: "Certifications",
    text: "Certificates for completed courses and internships, carrying your name, date and a Scholar AI record ID.",
  },
  {
    icon: Building2,
    title: "Jobs",
    text: "Entry-level roles matched to your skills, location and work-mode preferences, applied to from one profile.",
  },
  {
    icon: Bot,
    title: "AI Career Assistance",
    text: "An assistant that actually knows your profile — it shortlists opportunities and drafts your roadmap.",
  },
];

const JOURNEY: { step: string; icon: LucideIcon; text: string }[] = [
  {
    step: "Learn",
    icon: BookOpen,
    text: "Courses, modules and projects build a skill set you can demonstrate.",
  },
  {
    step: "Earn",
    icon: Wallet,
    text: "Scholarships fund your education while you are still studying.",
  },
  {
    step: "Experience",
    icon: Briefcase,
    text: "Internships and live projects add real work to your record.",
  },
  {
    step: "Get Certified",
    icon: Award,
    text: "Certificates are issued for completed learning and internships.",
  },
  {
    step: "Get Hired",
    icon: Rocket,
    text: "A profile, portfolio and AI assistant help you land the role.",
  },
];

const SPOTLIGHT_IDS = ["sch-novatech-coders", "sch-lumen-research", "sch-cypher-security"];

function HeroScene() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [10, -10]), {
    stiffness: 70,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-14, 14]), {
    stiffness: 70,
    damping: 20,
  });

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[520px]"
      style={{ perspective: "1400px" }}
      onMouseMove={(event) => {
        if (reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
        pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
      }}
      onMouseLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
      >
        {/* perspective floor */}
        <div
          className="grid-floor absolute bottom-[6%] left-[-10%] right-[-10%] h-[46%] opacity-70"
          style={{ transform: "rotateX(72deg)", transformOrigin: "bottom" }}
        />

        {/* orbit rings + AI core */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative">
            <div className="animate-spin-slow absolute -inset-14 rounded-full border border-cyan-300/25" />
            <div
              className="animate-spin-slow absolute -inset-24 rounded-full border border-violet-400/20"
              style={{
                transform: "rotateX(74deg)",
                animationDirection: "reverse",
              }}
            />
            <div className="animate-pulse-glow absolute -inset-6 rounded-full bg-cyan-400/25 blur-2xl" />
            <div className="glass glow-cyan relative grid size-32 place-items-center rounded-[2rem]">
              <GraduationCap className="size-14 text-cyan-200" />
              <span className="absolute -bottom-3 rounded-full border border-white/10 bg-[#0b1130] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                AI Campus
              </span>
            </div>
          </div>
        </div>

        {/* floating opportunity cards */}
        {FLOATERS.map((floater) => (
          <div
            key={floater.label}
            className={cn(
              "glass animate-float-soft absolute w-[46%] max-w-[200px] rounded-2xl p-3 shadow-[0_26px_50px_-30px_rgba(0,0,0,0.9)]",
              floater.position,
              floater.delay,
            )}
            style={{ "--tilt": `${floater.tilt}deg` } as CSSProperties}
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-white/10">
                <floater.icon className={cn("size-4", floater.accent)} />
              </span>
              <span className="font-display text-sm font-semibold text-foreground">
                {floater.label}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {floater.meta}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const store = useScholarStore();
  const student = getActiveStudent(store);

  const spotlights = useMemo(
    () =>
      SPOTLIGHT_IDS.map((id) =>
        store.scholarships.find((s) => s.id === id),
      ).filter((s): s is Scholarship => Boolean(s)),
    [store.scholarships],
  );

  const goAuth = (mode: "login" | "register") => navigate(`/auth?mode=${mode}`);

  /** Signed-out links land on the right auth tab: sign up for first-timers. */
  const authHref = (returnTo: string) => {
    const mode = store.students.length > 0 ? "login" : "register";
    return `/auth?mode=${mode}&returnTo=${encodeURIComponent(returnTo)}`;
  };
  const explore = () =>
    navigate(
      student ? "/dashboard/scholarships" : authHref("/dashboard/scholarships"),
    );
  const openDashboard = () =>
    navigate(student ? "/dashboard" : authHref("/dashboard"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen overflow-x-clip"
    >
      {/* ---------------- top bar ---------------- */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLockup onClick={() => navigate("/")} />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#platform">
              Platform
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="#scholarships"
            >
              Scholarships
            </a>
            <a className="transition-colors hover:text-foreground" href="#how">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {student ? (
              <Button className="gradient-button border-0" onClick={openDashboard}>
                Dashboard
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="hidden text-muted-foreground sm:inline-flex"
                  onClick={() => goAuth("login")}
                >
                  Login
                </Button>
                <Button
                  className="gradient-button border-0"
                  onClick={() => goAuth("register")}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="relative">
        <div className="starfield pointer-events-none absolute inset-0 opacity-70" />
        <div className="orb pointer-events-none absolute -top-24 left-[12%] size-96 bg-cyan-500/40" />
        <div className="orb pointer-events-none absolute right-[-6%] top-32 size-[420px] bg-violet-600/40" />
        <div className="orb pointer-events-none absolute bottom-[-10%] left-[-4%] size-80 bg-fuchsia-600/25" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-cyan-200">
              <BrandMark className="size-5 rounded-md" iconClassName="size-3" />
              Scholar AI · AI-powered student success platform
            </div>

            <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your AI campus for{" "}
              <span className="text-gradient">scholarships</span>, skills &amp;{" "}
              <span className="text-gradient">careers</span>.
            </h1>

            <div className="mt-6 flex flex-wrap gap-2">
              {TAGLINE.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              An AI-powered platform connecting students with scholarships,
              education, internships, certifications and career opportunities —
              one profile that follows you from the first course to the first
              offer.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gradient-button border-0 px-6"
                onClick={() => goAuth("register")}
              >
                Get Started
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 text-foreground hover:border-cyan-400/50 hover:bg-white/10"
                onClick={explore}
              >
                <Compass className="size-4" />
                Explore Opportunities
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                {student ? "Signed in as" : "Already have an account?"}
              </span>
              <Button
                variant="link"
                className="h-auto px-1 text-cyan-300"
                onClick={() => (student ? openDashboard() : goAuth("login"))}
              >
                Login
              </Button>
              <span aria-hidden="true">·</span>
              <span>{student ? "Want another account?" : "New here?"}</span>
              <Button
                variant="link"
                className="h-auto px-1 text-violet-300"
                onClick={() => goAuth("register")}
              >
                Register
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className="border-amber-300/40 bg-amber-400/10 text-amber-200"
              >
                Prototype
              </Badge>
              <span>
                Demo opportunity data, stored locally in your browser. No backend
                required.
              </span>
            </div>
          </div>

          <HeroScene />
        </div>
        <div className="hairline mx-auto max-w-6xl" />
      </section>

      {/* ---------------- platform pillars ---------------- */}
      <section id="platform" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            The platform
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Seven ways Scholar AI moves you forward
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every pillar writes back to the same student profile, so progress in
            one area immediately improves your recommendations in the next.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="glass glass-hover flex flex-col rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
                  <pillar.icon className="size-5 text-cyan-300" />
                </span>
                {pillar.live && (
                  <Badge className="border-transparent bg-cyan-400/15 text-cyan-200">
                    Live in this prototype
                  </Badge>
                )}
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold">
                {pillar.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                {pillar.text}
              </p>
              {pillar.live && (
                <Button
                  variant="link"
                  className="mt-4 h-auto justify-start px-0 text-cyan-300"
                  onClick={explore}
                >
                  Explore scholarships
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </article>
          ))}

          <div className="glass flex flex-col justify-center rounded-3xl p-6">
            <p className="font-display text-lg font-semibold text-gradient-soft">
              Everything in one student record
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Profile, skills, applications, learning and certificates stay in a
              single place — which is why the assistant can answer &ldquo;what
              should I do next?&rdquo; so precisely.
            </p>
            <Button
              variant="outline"
              className="mt-5 border-white/15 bg-white/5 hover:border-cyan-400/50"
              onClick={openDashboard}
            >
              Open the student dashboard
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- scholarship spotlight ---------------- */}
      <section id="scholarships" className="relative overflow-hidden py-20">
        <div className="orb pointer-events-none absolute right-[8%] top-10 size-72 bg-cyan-500/25" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
                Version 1 focus
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find the scholarship that fits you
              </h2>
              <p className="mt-4 text-muted-foreground">
                Search, filter by category, education level, location and
                eligibility, open the full details and submit an application —
                all inside the prototype, and every application shows up on your
                dashboard.
              </p>
            </div>
            <Button
              size="lg"
              className="gradient-button border-0"
              onClick={explore}
            >
              Explore all scholarships
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {spotlights.map((spotlight) => (
              <article
                key={spotlight.id}
                className="glass glass-hover flex flex-col rounded-3xl p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/15 text-muted-foreground"
                  >
                    {spotlight.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-amber-300/40 bg-amber-400/10 text-amber-200"
                  >
                    Demo data
                  </Badge>
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold leading-snug">
                  {spotlight.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {spotlight.organization}
                </p>
                <p className="text-gradient-soft mt-4 font-display text-xl font-semibold">
                  {spotlight.amount}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  Closes {formatDeadline(spotlight.deadline)}
                </div>
                <Button
                  variant="outline"
                  className="mt-5 border-white/15 bg-white/5 hover:border-cyan-400/50"
                  onClick={explore}
                >
                  View details
                  <ArrowRight className="size-4" />
                </Button>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">{DEMO_DATA_NOTICE}</p>
        </div>
      </section>

      {/* ---------------- journey ---------------- */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            How it works
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Learn · Earn · Experience · Get Certified · Get Hired
          </h2>
          <p className="mt-4 text-muted-foreground">
            The Scholar AI journey is one continuous loop: each stage feeds the
            next, and the assistant keeps pointing at the single best next step.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY.map((item, index) => (
            <li
              key={item.step}
              className="glass glass-hover relative rounded-3xl p-5"
            >
              <span className="text-xs font-semibold text-cyan-300/70">
                0{index + 1}
              </span>
              <span className="mt-3 grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
                <item.icon className="size-5 text-cyan-300" />
              </span>
              <h3 className="font-display mt-3 font-semibold">{item.step}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="glass relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-12">
          <div className="orb pointer-events-none absolute -top-16 left-1/2 size-72 -translate-x-1/2 bg-violet-600/40" />
          <div className="relative">
            <BrandMark
              className="mx-auto size-12 rounded-2xl"
              iconClassName="size-6"
            />
            <h2 className="font-display mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with scholarship discovery
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create your student profile in under a minute, get matched against
              the demo scholarship library and submit your first application.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="gradient-button border-0 px-6"
                onClick={() => goAuth("register")}
              >
                Get Started
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/15 bg-white/5 hover:border-cyan-400/50"
                onClick={() => goAuth("login")}
              >
                Login
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={explore}
              >
                Explore Opportunities
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Check className="size-3.5 text-emerald-300" />
              Local prototype account — your data stays in this browser
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="border-t border-white/5 bg-[#04061a]/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLockup />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              An AI-powered platform connecting students with scholarships,
              education, internships, certifications and career opportunities.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TAGLINE.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-cyan-300"
                  href="#platform"
                >
                  Platform
                </a>
              </li>
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-cyan-300"
                  href="#scholarships"
                >
                  Scholarships
                </a>
              </li>
              <li>
                <a
                  className="text-muted-foreground transition-colors hover:text-cyan-300"
                  href="#how"
                >
                  How it works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-cyan-300"
                  onClick={() => goAuth("login")}
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-cyan-300"
                  onClick={() => goAuth("register")}
                >
                  Register
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-cyan-300"
                  onClick={openDashboard}
                >
                  Student dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="hairline" />
          <div className="mt-6 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Scholar AI · Product prototype</p>
            <p>
              All scholarships, internships, courses and jobs shown are demo /
              sample data.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
