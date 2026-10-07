/**
 * Temporary SSR smoke test: renders every route with renderToString and checks
 * the required copy / form wiring. Run with: bun smoke.tmp.tsx
 */
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";

import { RequireStudent } from "./src/components/RequireStudent";
import Landing from "./src/pages/Landing";
import AuthPage from "./src/pages/Auth";
import DashboardShell from "./src/pages/Dashboard";
import Overview from "./src/pages/dashboard/Overview";
import ScholarshipsPage from "./src/pages/dashboard/Scholarships";
import ProfilePage from "./src/pages/dashboard/Profile";
import {
  DEMO_CREDENTIALS,
  signInStudent,
} from "./src/lib/scholar/store";

const convex = new ConvexReactClient(
  process.env.VITE_CONVEX_URL ?? "https://prototype.convex.cloud",
);

signInStudent(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);

let failures = 0;
function check(condition: boolean, label: string) {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures += 1;
    console.error(`  FAIL ${label}`);
  }
}

function render(url: string, element: React.ReactElement) {
  return renderToString(
    <ConvexAuthProvider client={convex}>
      <MemoryRouter initialEntries={[url]}>{element}</MemoryRouter>
    </ConvexAuthProvider>,
  );
}

function dashboardRoutes() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <RequireStudent>
            <DashboardShell />
          </RequireStudent>
        }
      >
        <Route index element={<Overview />} />
        <Route path="scholarships" element={<ScholarshipsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

console.log("\n— landing —");
try {
  const html = render("/", <Landing />);
  for (const needle of [
    "Your AI campus for",
    "Get Started",
    "Explore Opportunities",
    "Login",
    "Register",
    "Scholarship",
    "Internship",
    "Course",
    "Certificate",
    "Job",
    "Seven ways Scholar AI moves you forward",
    "Learn · Earn · Experience · Get Certified · Get Hired",
    "Demo data",
    "© 2026 Scholar AI",
  ]) {
    check(html.includes(needle), `contains "${needle}"`);
  }
} catch (error) {
  failures += 1;
  console.error("  FAIL landing threw:", error);
}

console.log("\n— auth (register) —");
try {
  const html = render("/auth?mode=register", <AuthPage redirectAfterAuth="/dashboard" />);
  for (const needle of [
    "Create your student account",
    'name="fullName"',
    'name="email"',
    'name="phone"',
    'name="password"',
    'name="college"',
    'name="degree"',
    'name="branch"',
    'name="gradYear"',
    'name="careerInterest"',
    'name="skills"',
    "Forgot password",
    "Create account",
  ]) {
    check(html.includes(needle), `contains ${needle}`);
  }
} catch (error) {
  failures += 1;
  console.error("  FAIL auth register threw:", error);
}

console.log("\n— auth (sign in) —");
try {
  const html = render("/auth", <AuthPage redirectAfterAuth="/dashboard" />);
  for (const needle of [
    "Welcome back",
    "Login",
    "Forgot password?",
    'type="password"',
    "Use the demo student account",
  ]) {
    check(html.includes(needle), `contains "${needle}"`);
  }
} catch (error) {
  failures += 1;
  console.error("  FAIL auth sign in threw:", error);
}

console.log("\n— dashboard overview —");
try {
  const html = render("/dashboard", dashboardRoutes());
  for (const needle of [
    "Your next best step:",
    "Complete your Web Development course",
    "Apply to 3 matching internships",
    "Build your portfolio project",
    "👋",
    "Profile completion",
    "Recommended scholarships",
    "Recent applications",
    "Find scholarships",
    "Logout",
    "Scholarships",
    "Profile",
  ]) {
    check(html.includes(needle), `contains "${needle}"`);
  }
  check(/Good (morning|afternoon|evening), \w+/.test(html), "greeting renders");
} catch (error) {
  failures += 1;
  console.error("  FAIL overview threw:", error);
}

console.log("\n— scholarships —");
try {
  const html = render("/dashboard/scholarships", dashboardRoutes());
  for (const needle of [
    "Search by scholarship",
    "All categories",
    "All education levels",
    "All locations",
    "Any eligibility",
    "Matches my profile",
    "NovaTech Future Coders Scholarship",
    "Demo / sample data",
    "View Details",
    "Apply",
    "Eligibility:",
    "Closes",
  ]) {
    check(html.includes(needle), `contains "${needle}"`);
  }
  const cards = html.split("View Details").length - 1;
  check(cards === 13, `renders all 13 cards (${cards})`);
} catch (error) {
  failures += 1;
  console.error("  FAIL scholarships threw:", error);
}

console.log("\n— profile —");
try {
  const html = render("/dashboard/profile", dashboardRoutes());
  for (const needle of [
    "Edit Profile",
    "Personal &amp; academic",
    "Skills",
    "Applications",
    "Profile completion",
    "jayanth@scholar.ai",
  ]) {
    check(html.includes(needle), `contains "${needle}"`);
  }
} catch (error) {
  failures += 1;
  console.error("  FAIL profile threw:", error);
}

console.log(
  failures === 0 ? "\nALL SMOKE CHECKS PASSED" : `\n${failures} SMOKE CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
