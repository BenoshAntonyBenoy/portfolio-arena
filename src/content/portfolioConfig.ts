// ============================================================================
// Single source of truth for every piece of editable content on the site.
// Edit text, links, and images here; components stay presentation-only.
// ============================================================================

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  handle: string;
  href: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type SkillGroup = {
  title: string;
  caption: string;
  items: string[];
};

export type AboutFact = {
  label: string;
  value: string;
};

export type ProjectImage = {
  src: string;
  srcSet?: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
};

export type Project = {
  index: string;
  name: string;
  kicker: string;
  year: string;
  summary: string;
  description: string;
  tech: string[];
  image: ProjectImage;
  featured?: boolean;
  highlights?: string[];
  liveUrl?: string;
  liveLabel?: string;
  githubUrl?: string;
  githubLabel?: string;
};

export type Achievement = {
  metric: string;
  title: string;
  description: string;
};

export type PortfolioConfig = {
  meta: {
    name: string;
    /** Full legal name - used only in the navbar beside the logo. */
    fullName: string;
    role: string;
    tagline: string;
    location: string;
    email: string;
    resumeUrl: string;
    avatar: string;
    siteUrl: string;
  };
  nav: NavItem[];
  headerCta: NavItem;
  socials: SocialLink[];
  hero: {
    eyebrow: string;
    nameLines: string[];
    intro: string;
    availability: string;
    primaryCta: NavItem;
    secondaryCta: NavItem;
    stats: Stat[];
    /** Small glass chips shown around the hero photo. */
    floatingTags: string[];
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    signature: string;
    facts: AboutFact[];
  };
  skills: {
    eyebrow: string;
    title: string;
    groups: SkillGroup[];
  };
  projects: {
    eyebrow: string;
    title: string;
    items: Project[];
  };
  achievements: {
    eyebrow: string;
    title: string;
    items: Achievement[];
  };
  contact: {
    eyebrow: string;
    title: string;
    prompt: string;
    emailLabel: string;
    resumeLabel: string;
    footerNote: string;
  };
};

export const portfolioConfig: PortfolioConfig = {
  meta: {
    name: "Benosh Benoy",
    fullName: "Benosh Antony Benoy",
    role: "Software & AI Developer · UI/UX Designer",
    tagline: "Building practical software, adaptive web tools, and thoughtful interfaces.",
    location: "Kerala, India",
    email: "benosh.benoy2@gmail.com",
    resumeUrl: "/resume.pdf",
    avatar: "/me.jpg",
    siteUrl: "https://portfolio.benosh.tech",
  },

  nav: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Work", href: "#projects" },
    { label: "Highlights", href: "#beyond" },
    { label: "Contact", href: "#contact" },
  ],

  headerCta: { label: "Résumé", href: "/resume.pdf" },

  socials: [
    { label: "GitHub", handle: "@BenoshAntonyBenoy", href: "https://github.com/BenoshAntonyBenoy" },
    { label: "LinkedIn", handle: "in/benoshbenoy", href: "https://www.linkedin.com/in/benoshbenoy" },
    { label: "Email", handle: "benosh.benoy2@gmail.com", href: "mailto:benosh.benoy2@gmail.com" },
    { label: "Discord", handle: "_benosh", href: "https://discord.com/users/1411172685932920984" },
  ],

  hero: {
    eyebrow: "Open to software & product opportunities",
    nameLines: ["Benosh", "Benoy"],
    intro:
      "Computer Science and Artificial Intelligence student building practical software, browser tools, desktop programs, and polished interfaces, backed by hands-on UI, poster, image, and video design experience.",
    availability: "Kerala · Remote",
    primaryCta: { label: "Explore my work", href: "#projects" },
    secondaryCta: { label: "View résumé", href: "/resume.pdf" },
    stats: [
      { value: "100+", label: "UI & creative designs" },
      { value: "5+", label: "Hackathons" },
      { value: "5", label: "Programming languages" },
    ],
    floatingTags: ["Python", "JavaScript", "Machine Learning", "UI/UX"],
  },

  about: {
    eyebrow: "Education, focus, and approach",
    title: "Engineering with a designer's eye.",
    paragraphs: [
      "I am Benosh Antony Benoy, a B.Tech Computer Science (Artificial Intelligence) student at Mar Baselios College of Engineering and Technology, Kerala.",
      "I build practical products across the browser and desktop - from adaptive typing systems and data-rich Python interfaces to machine-learning workflows.",
      "My strongest work starts with a clear problem, uses the simplest reliable tools, and treats usability as part of the engineering - not a finishing layer.",
    ],
    signature: "Software engineering · AI/ML · Product design",
    facts: [
      { label: "Education", value: "B.Tech in Computer Science (Artificial Intelligence)" },
      { label: "College", value: "Mar Baselios College of Engineering and Technology" },
      { label: "Timeline", value: "2025 - Present" },
      { label: "Focus", value: "Software, machine learning, and interface design" },
    ],
  },

  skills: {
    eyebrow: "Skills & tools",
    title: "A focused, practical toolkit.",
    groups: [
      {
        title: "Languages",
        caption: "Core languages used across my projects.",
        items: ["Python", "JavaScript", "TypeScript", "C", "SQL"],
      },
      {
        title: "Web & Product",
        caption: "Accessible interfaces and browser-based tools.",
        items: ["React", "Vite", "HTML & CSS", "Browser APIs", "Responsive UI"],
      },
      {
        title: "AI / ML & Data",
        caption: "From structured data to evaluated models.",
        items: ["CatBoost", "scikit-learn", "Pandas", "NumPy", "Jupyter"],
      },
      {
        title: "Design, Media & Desktop",
        caption: "Interface, visual media, and desktop application work.",
        items: [
          "Figma",
          "UI/UX Design",
          "Prototyping",
          "Poster Design",
          "Image Editing",
          "Video Editing",
          "Python Desktop UI",
          "Data Visualisation",
        ],
      },
    ],
  },

  projects: {
    eyebrow: "Six selected builds",
    title: "Work with proof.",
    items: [
      {
        index: "01",
        name: "BQuick - Pro Typing Trainer",
        kicker: "Adaptive Web App",
        year: "2026",
        summary: "Typing practice built around the transitions that slow you down.",
        description:
          "An adaptive browser typing trainer that measures dwell and flight time for every keystroke, identifies weak key-to-key transitions, and turns them into focused drills.",
        tech: ["JavaScript", "Browser APIs", "Adaptive Analytics"],
        image: {
          src: "/projects/bquick-1255.webp",
          srcSet: "/projects/bquick-640.webp 640w, /projects/bquick-1255.webp 1255w",
          alt: "BQuick code-mode typing session with live line, speed, and accuracy statistics",
          fit: "contain",
          position: "center",
        },
        featured: true,
        highlights: [
          "Practice, timed tests, and full-program typing for C, Java, and Python",
          "Variance-weighted weak-transition ranking and adaptive drills",
          "Progress, analytics, and sound preferences stored locally",
        ],
        liveUrl: "https://bquick.benosh.tech/",
        liveLabel: "Try BQuick",
      },
      {
        index: "02",
        name: "Student Report Analyser",
        kicker: "Python Desktop Tool",
        year: "2026",
        summary: "Class performance, ranking, and subject-level insight in one focused interface.",
        description:
          "A Python desktop application for reviewing student results through rank, totals, class averages, pass status, subject breakdowns, comparison charts, and radar views.",
        tech: ["Python", "Desktop UI", "Data Visualisation"],
        image: {
          src: "/projects/student-report-1280.webp",
          srcSet: "/projects/student-report-640.webp 640w, /projects/student-report-1280.webp 1280w",
          alt: "Student report dashboard showing marks, class averages, a bar chart, and a radar chart",
        },
      },
      {
        index: "03",
        name: "Personal Budget Tracker",
        kicker: "Python Finance Tool",
        year: "2026",
        summary: "A clearer way to understand spending, limits, and purchase decisions.",
        description:
          "A Python desktop dashboard with income and expense summaries, budget alerts, recent transactions, category charts, and a purchase check that shows whether an item fits the remaining budget.",
        tech: ["Python", "Desktop UI", "Data Visualisation"],
        image: {
          src: "/projects/budget-tracker-1280.webp",
          srcSet: "/projects/budget-tracker-640.webp 640w, /projects/budget-tracker-1280.webp 1280w",
          alt: "Personal Budget Tracker dashboard with financial summaries, expense chart, alerts, and purchase check",
        },
      },
      {
        index: "04",
        name: "Game Store Management System",
        kicker: "Python Desktop Program",
        year: "2026",
        summary: "A practical command centre for catalogue, stock, and daily sales.",
        description:
          "A Python desktop program for managing a game-store catalogue and day-to-day sales, with an at-a-glance dashboard for inventory, low-stock items, and transaction activity.",
        tech: ["Python", "Desktop UI", "Inventory"],
        image: {
          src: "/projects/game-store-1280.webp",
          srcSet: "/projects/game-store-640.webp 640w, /projects/game-store-1280.webp 1280w",
          alt: "Game Store Manager desktop dashboard with inventory, stock, and sales information",
        },
      },
      {
        index: "05",
        name: "Google Pay Mobile Redesign",
        kicker: "Mobile UI Concept",
        year: "2026",
        summary: "A darker, wallet-first visual direction for a familiar payment experience.",
        description:
          "A Figma mobile redesign concept exploring a focused entry experience for Google Pay through a dark interface, simplified visual hierarchy, and a bold wallet motif.",
        tech: ["Figma", "Mobile UI", "Prototyping"],
        image: {
          src: "/projects/gpay-redesign-440.webp",
          alt: "Dark Google Pay mobile splash-screen concept with a yellow wallet symbol",
          fit: "cover",
          position: "center 48%",
        },
      },
      {
        index: "06",
        name: "Retail Demand Prediction",
        kicker: "Machine Learning Notebook",
        year: "2026",
        summary: "A structured forecasting workflow from holdout evaluation to submission validation.",
        description:
          "A notebook-based demand-prediction pipeline using CatBoost, holdout evaluation, bounded predictions, and checks that validate column order, row count, indices, and export format.",
        tech: ["Python", "CatBoost", "Pandas", "Jupyter"],
        image: {
          src: "/projects/retail-demand-916.webp",
          srcSet: "/projects/retail-demand-640.webp 640w, /projects/retail-demand-916.webp 916w",
          alt: "Jupyter notebook showing a retail demand prediction and submission-validation pipeline",
          fit: "cover",
          position: "center 30%",
        },
      },
    ],
  },

  achievements: {
    eyebrow: "Evidence beyond the project grid",
    title: "Highlights that shaped me.",
    items: [
      {
        metric: "5+",
        title: "Hackathons & build sprints",
        description:
          "Built and pitched under pressure across five-plus hackathons, including a GDGC MBCET vibe-coding event.",
      },
      {
        metric: "1st",
        title: "WormsWood Chess Tournament",
        description: "Won first place in a chess tournament through patient calculation, preparation, and composure.",
      },
      {
        metric: "3rd",
        title: "A-Zone Chess Championship",
        description: "Placed third while representing the MBCET college team at inter-college level.",
      },
      {
        metric: "2025→",
        title: "B.Tech CSE (AI)",
        description: "Studying Computer Science with an Artificial Intelligence specialization at MBCET.",
      },
    ],
  },

  contact: {
    eyebrow: "Open to useful, ambitious work",
    title: "Let's build.",
    prompt:
      "If you are hiring for software, AI/ML, or product-focused opportunities - or have a project that needs careful engineering and design - I would like to hear from you.",
    emailLabel: "Email me",
    resumeLabel: "View résumé",
    footerNote: "Built with care in Kerala",
  },
};
