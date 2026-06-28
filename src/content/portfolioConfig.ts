// ============================================================================
// Single source of truth for every piece of editable content on the site.
// Edit text, links, and images here — components stay presentation-only.
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

export type Project = {
  index: string;
  name: string;
  description: string;
  tech: string[];
  /** Optional preview image served from /public. Omit to render a generated cover. */
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
};

export type Achievement = {
  metric: string;
  title: string;
  description: string;
};

export type PortfolioConfig = {
  meta: {
    name: string;
    /** Full legal name — used ONLY in the navbar beside the logo. */
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
  socials: SocialLink[];
  hero: {
    eyebrow: string;
    nameLines: string[];
    intro: string;
    availability: string;
    primaryCta: NavItem;
    secondaryCta: NavItem;
    stats: Stat[];
    /** Small glass chips that float around the hero photo. */
    floatingTags: string[];
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    signature: string;
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
    role: "Developer · Designer · Strategist",
    tagline: "Building at the intersection of code, AI, and design.",
    location: "Kerala, India",
    email: "benosh.benoy2@gmail.com",
    resumeUrl: "/resume.pdf",
    avatar: "/me.jpg",
    siteUrl: "https://portfolio.benosh.tech",
  },

  nav: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Beyond", href: "#beyond" },
    { label: "Contact", href: "#contact" },
  ],

  socials: [
    { label: "GitHub", handle: "@BenoshAntonyBenoy", href: "https://github.com/BenoshAntonyBenoy" },
    { label: "LinkedIn", handle: "in/benoshbenoy", href: "https://www.linkedin.com/in/benoshbenoy" },
    { label: "Email", handle: "benosh.benoy2@gmail.com", href: "mailto:benosh.benoy2@gmail.com" },
  ],

  hero: {
    eyebrow: "Available for collaborations",
    nameLines: ["Benosh", "Benoy"],
    intro:
      "Computer Science student building things that think. I live where engineering meets aesthetics — writing code that works and interfaces that feel right.",
    availability: "Kerala, India",
    primaryCta: { label: "View my work", href: "#projects" },
    secondaryCta: { label: "Get in touch", href: "#contact" },
    stats: [
      { value: "5+", label: "Hackathons" },
      { value: "5+", label: "Shipped projects" },
      { value: "2+ yrs", label: "Markets experience" },
    ],
    floatingTags: ["AI", "Next.js", "Design", "Builder"],
  },

  about: {
    eyebrow: "Who's behind the pixels?",
    title: "I build things that think.",
    paragraphs: [
      "I am Benosh Antony Benoy, a computer science student building AI tools, web apps, and clean digital interfaces.",
      "I live where engineering meets aesthetics — writing code that works and interfaces that feel right. From Python tools to AI experiments to UI case studies, I care about the craft end to end.",
      "Code as craft. Design as language. Strategy as the thread between them. I think about products strategically, not just visually — and I have a soft spot for ideas that earn their complexity.",
    ],
    signature: "Code as craft · Design as language · Strategy as the thread.",
  },

  skills: {
    eyebrow: "Skills & tools",
    title: "The toolkit I reach for.",
    groups: [
      {
        title: "Languages",
        caption: "Where the logic lives.",
        items: ["Python", "C", "SQL"],
      },
      {
        title: "AI / ML & Data",
        caption: "Models, math, and meaning.",
        items: ["scikit-learn", "Pandas", "NumPy", "Matplotlib", "Regression"],
      },
      {
        title: "Design",
        caption: "Interfaces that feel right.",
        items: ["Figma", "UI Design", "Prototyping", "Video Editing"],
      },
      {
        title: "Build & Craft",
        caption: "Turning ideas into tools.",
        items: ["Tkinter", "SQLite", "OOP", "Stock Analysis"],
      },
    ],
  },

  projects: {
    eyebrow: "Featured projects",
    title: "Selected work.",
    items: [
      {
        index: "01",
        name: "Student Report Analyser",
        description:
          "A desktop tool that ingests student marksheets and turns them into clear, actionable performance insights — trends, weak areas, and printable summaries through a clean GUI.",
        tech: ["Python", "Tkinter", "Pandas", "Matplotlib"],
        image: "/projects/student-report.png",
        githubUrl: "https://github.com/BenoshAntonyBenoy",
      },
      {
        index: "02",
        name: "Game Store Management System",
        description:
          "An inventory and sales management system for a game store: stock tracking, billing, and customer records backed by a structured database layer.",
        tech: ["Python", "SQLite", "OOP"],
        githubUrl: "https://github.com/BenoshAntonyBenoy",
      },
      {
        index: "03",
        name: "Personal Budget Tracker",
        description:
          "A friendly budgeting app to log expenses, set category limits, and visualise where the money actually goes — with charts that make overspending obvious.",
        tech: ["Python", "Matplotlib", "Data Viz"],
        githubUrl: "https://github.com/BenoshAntonyBenoy",
      },
      {
        index: "04",
        name: "Google Pay Mobile App Redesign",
        description:
          "An end-to-end UX case study reimagining the Google Pay flow — research, wireframes, and a polished high-fidelity prototype focused on clarity and trust.",
        tech: ["Figma", "UX Research", "Prototyping"],
      },
      {
        index: "05",
        name: "ML Regression Models",
        description:
          "A series of regression experiments predicting numerical outcomes across small datasets — exploring feature engineering, model selection, and evaluation metrics in practice.",
        tech: ["Python", "scikit-learn", "NumPy", "Pandas"],
        githubUrl: "https://github.com/BenoshAntonyBenoy",
      },
    ],
  },

  achievements: {
    eyebrow: "Strategy, on and off the board",
    title: "Beyond the code.",
    items: [
      {
        metric: "5+",
        title: "Hackathons",
        description:
          "Built and pitched under pressure across 5+ hackathons — fast prototyping, tight teams, real deadlines.",
      },
      {
        metric: "1st",
        title: "Chess — MBCET",
        description:
          "First place at the college championship and third at the inter-college level. The board is where I practise strategy.",
      },
      {
        metric: "2+ yrs",
        title: "Stock Markets",
        description:
          "Two-plus years reading markets — patience, risk, and reading second-order effects before they show up.",
      },
      {
        metric: "∞",
        title: "Always Learning",
        description:
          "Continuously exploring AI and machine learning — the field moves fast, and so do I.",
      },
    ],
  },

  contact: {
    eyebrow: "Let's build something remarkable",
    title: "Let's talk.",
    prompt:
      "Got a question, a proposal, a project, or just want to build something together? My inbox is always open.",
    emailLabel: "Send me an email",
    resumeLabel: "Download résumé",
    footerNote: "Designed & built by Benosh Benoy",
  },
};
