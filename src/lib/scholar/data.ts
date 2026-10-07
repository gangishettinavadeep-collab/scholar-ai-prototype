/**
 * Scholar AI — demo opportunity data.
 *
 * Every listing below is SAMPLE / DEMO data created for this prototype.
 * These are not verified, live, currently-open opportunities and the prototype
 * never claims otherwise: the UI surfaces a "Demo data" label on every card.
 */

export const DEMO_DATA_NOTICE =
  "Prototype demo listing — sample opportunity data for demonstrating the Scholar AI experience. Not a verified, currently-open offer.";

export type ScholarshipCategory =
  | "Merit"
  | "Need-based"
  | "Research"
  | "Women in STEM"
  | "Sports"
  | "Government"
  | "International"
  | "Entrepreneurship";

export type EducationLevel =
  | "Undergraduate"
  | "Postgraduate"
  | "Diploma"
  | "All levels";

export type YearGroup = "1st year" | "2nd year" | "3rd year" | "Final year";

export type Scholarship = {
  id: string;
  name: string;
  organization: string;
  category: ScholarshipCategory;
  level: EducationLevel;
  location: string;
  amount: string;
  duration: string;
  /** ISO date, yyyy-mm-dd */
  deadline: string;
  description: string;
  eligibility: string;
  benefits: string[];
  /** "Any" or branch codes the student's branch must be in */
  branches: string[];
  /** "Any" or career interests the scholarship supports */
  interests: string[];
  yearGroups: YearGroup[] | "Any";
  needsBased: boolean;
};

export const DEGREES = [
  "B.Tech",
  "BCA",
  "B.Sc",
  "BBA",
  "Diploma",
  "M.Tech",
  "MCA",
  "M.Sc",
  "MBA",
] as const;

export const BRANCHES = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Other",
] as const;

export const CAREER_INTERESTS = [
  "Software Development",
  "Data Science & AI",
  "Product Design",
  "Cybersecurity",
  "Cloud & DevOps",
  "Finance & Consulting",
  "Marketing & Media",
  "Research & Academia",
] as const;

export const GRAD_YEARS = ["2027", "2028", "2029", "2030", "2031", "2032"];

export const SCHOLARSHIP_CATEGORIES: ScholarshipCategory[] = [
  "Merit",
  "Need-based",
  "Research",
  "Women in STEM",
  "Sports",
  "Government",
  "International",
  "Entrepreneurship",
];

/**
 * Options for the eligibility filter dropdown on the scholarships page.
 * Lives here (not in the page component) so both the UI and verification
 * scripts can read the same list — dropdown items are portal-gated in the DOM.
 */
export const ELIGIBILITY_OPTIONS: { value: string; label: string }[] = [
  { value: "any", label: "Any eligibility" },
  { value: "profile", label: "Matches my profile" },
  { value: "all-years", label: "Open to all years" },
  { value: "final", label: "Final year students" },
  { value: "early", label: "First & second year" },
  { value: "postgrad", label: "Postgraduate students" },
  { value: "need", label: "Need-based support" },
];

/** Values used by the eligibility filter on the scholarships page. */
export function matchesEligibilityFilter(
  scholarship: Scholarship,
  value: string,
): boolean {
  switch (value) {
    case "all-years":
      return scholarship.yearGroups === "Any";
    case "final":
      return (
        scholarship.yearGroups === "Any" ||
        scholarship.yearGroups.includes("Final year")
      );
    case "early":
      return (
        scholarship.yearGroups === "Any" ||
        scholarship.yearGroups.includes("1st year") ||
        scholarship.yearGroups.includes("2nd year")
      );
    case "postgrad":
      return (
        scholarship.level === "Postgraduate" ||
        scholarship.level === "All levels"
      );
    case "need":
      return scholarship.needsBased;
    default:
      return true;
  }
}

export const SCHOLARSHIP_LEVELS: EducationLevel[] = [
  "Undergraduate",
  "Postgraduate",
  "Diploma",
  "All levels",
];

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch-novatech-coders",
    name: "NovaTech Future Coders Scholarship",
    organization: "NovaTech Foundation",
    category: "Merit",
    level: "Undergraduate",
    location: "India",
    amount: "₹1,50,000 per year",
    duration: "Up to 3 years",
    deadline: "2026-11-30",
    description:
      "Supports high-performing undergraduate students who are building real software. Recipients get tuition support, a mentor from the NovaTech engineering team and a summer demo day.",
    eligibility:
      "Undergraduate students (B.Tech / BCA / B.Sc CS), CGPA 7.0+ or equivalent, at least one personal project or open-source contribution.",
    benefits: [
      "₹1,50,000 annual tuition support",
      "1:1 mentor from industry engineering team",
      "Summer demo day with hiring partners",
    ],
    branches: ["CSE", "IT", "ECE"],
    interests: ["Software Development", "Cloud & DevOps"],
    yearGroups: "Any",
    needsBased: false,
  },
  {
    id: "sch-bharat-means",
    name: "Bharat Merit-cum-Means Award",
    organization: "Bharat Merit Trust",
    category: "Need-based",
    level: "All levels",
    location: "India",
    amount: "₹1,00,000 + laptop",
    duration: "1 year, renewable",
    deadline: "2026-12-15",
    description:
      "Need-based support for students who rank well academically but need financial help to continue. Covers tuition and includes a device grant for the first year.",
    eligibility:
      "Family income below ₹6 LPA, merit in the last qualifying examination, enrolled in a recognised Indian institution.",
    benefits: [
      "₹1,00,000 tuition support",
      "Laptop device grant",
      "Renewable on academic progress",
    ],
    branches: ["Any"],
    interests: ["Any"],
    yearGroups: "Any",
    needsBased: true,
  },
  {
    id: "sch-elevate-firstgen",
    name: "Elevate First-Gen Scholars Grant",
    organization: "Elevate Foundation",
    category: "Need-based",
    level: "Postgraduate",
    location: "India",
    amount: "₹1,80,000 per year",
    duration: "2 years",
    deadline: "2026-10-20",
    description:
      "For first-generation postgraduate students who are the first in their family to pursue a master's degree. Includes a career coach for the final placement season.",
    eligibility:
      "First-generation postgraduate students, family income below ₹8 LPA, admission letter from a recognised institution.",
    benefits: [
      "₹1,80,000 annual support",
      "Placement career coach",
      "Alumni community access",
    ],
    branches: ["Any"],
    interests: ["Any"],
    yearGroups: ["Final year"],
    needsBased: true,
  },
  {
    id: "sch-women-stem",
    name: "Women in STEM Leaders Grant",
    organization: "Astra Learning Labs",
    category: "Women in STEM",
    level: "Undergraduate",
    location: "India",
    amount: "₹2,00,000 per year",
    duration: "2 years",
    deadline: "2027-01-20",
    description:
      "Funds women in technology and science programs who show leadership in clubs, hackathons or community teaching. Includes a technical mentor circle.",
    eligibility:
      "Women students in CSE, IT, ECE, EEE or Sciences, active participation in at least one technical community.",
    benefits: [
      "₹2,00,000 annual grant",
      "Mentor circle with senior engineers",
      "Conference travel support",
    ],
    branches: ["CSE", "IT", "ECE", "EEE"],
    interests: [
      "Software Development",
      "Data Science & AI",
      "Cybersecurity",
      "Research & Academia",
    ],
    yearGroups: ["1st year", "2nd year", "3rd year"],
    needsBased: false,
  },
  {
    id: "sch-lumen-research",
    name: "Lumen Analytics Research Fellowship",
    organization: "Lumen Analytics",
    category: "Research",
    level: "Postgraduate",
    location: "Global",
    amount: "$4,000 research stipend",
    duration: "6 months",
    deadline: "2026-11-18",
    description:
      "A part-time fellowship for students working on applied data, ML or statistics research. Fellows publish a short paper with a Lumen research mentor.",
    eligibility:
      "Final-year or postgraduate students with a research abstract, basic statistics or ML coursework.",
    benefits: [
      "$4,000 stipend",
      "Co-authored publication",
      "Lab compute credits",
    ],
    branches: ["CSE", "IT", "ECE", "EEE"],
    interests: ["Data Science & AI", "Research & Academia"],
    yearGroups: ["Final year"],
    needsBased: false,
  },
  {
    id: "sch-helios-cloud",
    name: "Helios Cloud Builders Scholarship",
    organization: "Helios Systems",
    category: "Merit",
    level: "Undergraduate",
    location: "India",
    amount: "₹1,25,000 per year",
    duration: "1 year, renewable",
    deadline: "2026-12-05",
    description:
      "Recognises students who deploy and operate real systems — containers, cloud services, CI/CD pipelines. Includes certification exam vouchers.",
    eligibility:
      "2nd year and above in a computing or electronics branch, one deployed project or cloud certification in progress.",
    benefits: [
      "₹1,25,000 annual support",
      "Certification exam voucher",
      "Cloud lab credits",
    ],
    branches: ["CSE", "IT", "ECE"],
    interests: ["Cloud & DevOps", "Software Development"],
    yearGroups: ["2nd year", "3rd year", "Final year"],
    needsBased: false,
  },
  {
    id: "sch-cypher-security",
    name: "Cypher Security Scholars Program",
    organization: "Cypher Security Guild",
    category: "Merit",
    level: "Undergraduate",
    location: "India",
    amount: "₹1,20,000 per year",
    duration: "1 year",
    deadline: "2026-12-18",
    description:
      "For students who take security seriously — CTF players, bug bounty hunters and security enthusiasts. Funds training and competition travel.",
    eligibility:
      "2nd and 3rd year students in CSE/IT/ECE, participation in a CTF or completed a security course.",
    benefits: [
      "₹1,20,000 annual support",
      "CTF team travel funding",
      "Industry certification vouchers",
    ],
    branches: ["CSE", "IT", "ECE"],
    interests: ["Cybersecurity"],
    yearGroups: ["2nd year", "3rd year"],
    needsBased: false,
  },
  {
    id: "sch-meridian-leadership",
    name: "Meridian Bank Future Leaders Award",
    organization: "Meridian Bank",
    category: "Merit",
    level: "All levels",
    location: "India",
    amount: "₹1,00,000 + internship",
    duration: "1 year",
    deadline: "2027-01-10",
    description:
      "A combined grant and summer internship for students interested in finance, fintech and consulting. Internship interviews are guaranteed for shortlisted scholars.",
    eligibility:
      "Final-year students of any discipline with strong communication skills and an interest in finance or consulting.",
    benefits: [
      "₹1,00,000 grant",
      "Guaranteed internship interview",
      "Leadership bootcamp seat",
    ],
    branches: ["Any"],
    interests: ["Finance & Consulting", "Marketing & Media"],
    yearGroups: ["Final year"],
    needsBased: false,
  },
  {
    id: "sch-india-skills",
    name: "India National Skills Scholarship",
    organization: "Ministry of Skills & Future Work (demo)",
    category: "Government",
    level: "Diploma",
    location: "India",
    amount: "₹75,000 per year",
    duration: "2 years",
    deadline: "2027-02-28",
    description:
      "A government-style scholarship for diploma students in technical programs, supporting tools, materials and examination fees.",
    eligibility:
      "1st and 2nd year diploma students in a recognised polytechnic, 60%+ in the qualifying examination.",
    benefits: [
      "₹75,000 annual support",
      "Tool and material allowance",
      "Exam fee coverage",
    ],
    branches: ["Mechanical", "Civil", "ECE", "EEE", "Other"],
    interests: ["Any"],
    yearGroups: ["1st year", "2nd year"],
    needsBased: false,
  },
  {
    id: "sch-global-minds",
    name: "Global Minds Exchange Scholarship",
    organization: "Global Minds Alliance",
    category: "International",
    level: "All levels",
    location: "Global",
    amount: "$6,000 mobility grant",
    duration: "1 semester",
    deadline: "2027-03-15",
    description:
      "Funds a semester abroad or an international virtual exchange program, including a project collaboration with a partner university.",
    eligibility:
      "Enrolled students with a project or research proposal and English proficiency evidence.",
    benefits: [
      "$6,000 mobility grant",
      "Partner university placement support",
      "International project team",
    ],
    branches: ["Any"],
    interests: ["Any"],
    yearGroups: "Any",
    needsBased: false,
  },
  {
    id: "sch-quantum-sports",
    name: "Quantum League Sports Quota",
    organization: "Quantum League (demo)",
    category: "Sports",
    level: "All levels",
    location: "India",
    amount: "₹90,000 per year",
    duration: "1 year, renewable",
    deadline: "2026-11-05",
    description:
      "Supports student athletes who maintain their academic standing while competing at state or national level.",
    eligibility:
      "State / national level athletes, minimum 50% marks, coach or federation endorsement.",
    benefits: [
      "₹90,000 annual support",
      "Training and travel allowance",
      "Flexible examination schedule requests",
    ],
    branches: ["Any"],
    interests: ["Any"],
    yearGroups: "Any",
    needsBased: false,
  },
  {
    id: "sch-ignite-founders",
    name: "Ignite Founders Grant",
    organization: "Ignite Ventures",
    category: "Entrepreneurship",
    level: "All levels",
    location: "Online",
    amount: "₹2,50,000 pilot grant",
    duration: "6 months",
    deadline: "2027-01-31",
    description:
      "Non-dilutive pilot funding for student teams building a product. Includes weekly office hours with operators and a demo day.",
    eligibility:
      "Student teams of 2+, a working prototype or clear plan, pitch deck of max 10 slides.",
    benefits: [
      "₹2,50,000 pilot grant",
      "Weekly operator office hours",
      "Demo day with investors",
    ],
    branches: ["Any"],
    interests: ["Software Development", "Product Design", "Finance & Consulting"],
    yearGroups: "Any",
    needsBased: false,
  },
  {
    id: "sch-prism-creative",
    name: "Prism Creative Minds Scholarship",
    organization: "Prism Media Labs",
    category: "Merit",
    level: "Undergraduate",
    location: "India",
    amount: "₹80,000 per year",
    duration: "1 year",
    deadline: "2027-04-30",
    description:
      "For students who design, film, write or build brand experiences. Applicants submit a small portfolio of three pieces.",
    eligibility:
      "Undergraduate students in any discipline with a 3-piece portfolio in design, content or media.",
    benefits: [
      "₹80,000 annual support",
      "Portfolio review with studio leads",
      "Freelance project referrals",
    ],
    branches: ["Any"],
    interests: ["Product Design", "Marketing & Media"],
    yearGroups: "Any",
    needsBased: false,
  },
];

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

export function degreeLevel(degree: string): EducationLevel {
  if (["M.Tech", "MCA", "M.Sc", "MBA"].includes(degree)) return "Postgraduate";
  if (degree === "Diploma") return "Diploma";
  return "Undergraduate";
}

/**
 * Maps a graduation year to the academic year group the student sits in
 * right now (graduating this calendar year == Final year).
 */
export function yearGroupForGradYear(gradYear: string): YearGroup {
  const graduating = Number.parseInt(gradYear, 10);
  const current = new Date().getFullYear();
  if (Number.isNaN(graduating)) return "Final year";
  const remaining = graduating - current;
  if (remaining <= 1) return "Final year";
  if (remaining === 2) return "3rd year";
  if (remaining === 3) return "2nd year";
  return "1st year";
}

export function parseDeadline(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function formatDeadline(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDeadline(iso));
}

export function daysUntil(iso: string): number {
  const deadline = parseDeadline(iso).getTime();
  const now = Date.now();
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
}

export function isClosingSoon(iso: string): boolean {
  const days = daysUntil(iso);
  return days >= 0 && days <= 30;
}

export function isExpired(iso: string): boolean {
  return daysUntil(iso) < 0;
}

export type ProfileLike = {
  branch: string;
  degree: string;
  careerInterest: string;
  gradYear: string;
};

/** Does this scholarship fit the student's branch / level / interest / year? */
export function scholarshipMatchesProfile(
  scholarship: Scholarship,
  student: ProfileLike,
): boolean {
  const level = degreeLevel(student.degree);
  const levelOk =
    scholarship.level === "All levels" || scholarship.level === level;
  const branchOk =
    scholarship.branches.includes("Any") ||
    scholarship.branches.includes(student.branch);
  const interestOk =
    scholarship.interests.includes("Any") ||
    scholarship.interests.includes(student.careerInterest);
  const yearOk =
    scholarship.yearGroups === "Any" ||
    scholarship.yearGroups.includes(yearGroupForGradYear(student.gradYear));
  return levelOk && branchOk && interestOk && yearOk;
}

/** Higher score = better recommendation. */
export function matchScore(
  scholarship: Scholarship,
  student: ProfileLike,
): number {
  let score = 0;
  if (scholarship.level === degreeLevel(student.degree)) score += 3;
  if (scholarship.branches.includes(student.branch)) score += 2;
  if (scholarship.interests.includes(student.careerInterest)) score += 4;
  if (scholarship.yearGroups === "Any") score += 1;
  return score;
}
