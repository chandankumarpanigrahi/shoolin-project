// Shared Links & Knowledge Directory organized by Project/Brand, Category, and Sub-Category
export const INITIAL_LINKS = [
  // PMV Project Links
  {
    id: "lnk-1",
    name: "Production Corporate Portal",
    category: "Websites & Portals",
    type: "Official Website",
    subCategory: "Official Website",
    brand: "PMV",
    url: "https://pmv-global.com",
    addedBy: "usr-1",
    updatedDate: "2026-08-15",
    description: "Main production domain with multi-region CDN and multilingual routing."
  },
  {
    id: "lnk-2",
    name: "Staging QA Preview Environment",
    category: "Websites & Portals",
    type: "Staging / QA",
    subCategory: "Staging / QA",
    brand: "PMV",
    url: "https://staging.pmv-global.internal",
    addedBy: "usr-5",
    updatedDate: "2026-09-08",
    description: "Nightly CI/CD build deployment for client QA and visual regression testing."
  },
  {
    id: "lnk-3",
    name: "PMV Master Brand Tokens & Figma System",
    category: "Documents & Assets",
    type: "Figma",
    subCategory: "Figma",
    brand: "PMV",
    url: "https://figma.com/@pmv-design-tokens",
    addedBy: "usr-4",
    updatedDate: "2026-08-30",
    description: "Complete design system with 240+ components, typography scale, and color variables."
  },
  {
    id: "lnk-4",
    name: "Official LinkedIn Corporate Page",
    category: "Social Media",
    type: "LinkedIn",
    subCategory: "LinkedIn",
    brand: "PMV",
    url: "https://linkedin.com/company/pmv-global",
    addedBy: "usr-6",
    updatedDate: "2026-09-02",
    description: "B2B announcements, hiring posts, and executive thought leadership articles."
  },
  {
    id: "lnk-13",
    name: "PMV Official Instagram Brand Handle",
    category: "Social Media",
    type: "Instagram",
    subCategory: "Instagram",
    brand: "PMV",
    url: "https://instagram.com/pmv_global",
    addedBy: "usr-6",
    updatedDate: "2026-09-05",
    description: "Official Instagram feed for company events, behind the scenes, and team spotlights."
  },
  {
    id: "lnk-14",
    name: "PMV YouTube Video Case Studies",
    category: "Social Media",
    type: "YouTube",
    subCategory: "YouTube",
    brand: "PMV",
    url: "https://youtube.com/@pmv-global-official",
    addedBy: "usr-6",
    updatedDate: "2026-09-01",
    description: "Video demos, webinar recordings, and maritime tech keynotes."
  },

  // FreshPod Project Links
  {
    id: "lnk-5",
    name: "FreshPod Web Commerce App",
    category: "Websites & Portals",
    type: "Official Website",
    subCategory: "Official Website",
    brand: "FreshPod",
    url: "https://app.freshpod.market",
    addedBy: "usr-3",
    updatedDate: "2026-08-20",
    description: "Responsive web commerce application for instant organic grocery orders."
  },
  {
    id: "lnk-6",
    name: "FreshPod Merchant & Fleet Control Tower",
    category: "Websites & Portals",
    type: "Admin Panel",
    subCategory: "Admin Panel",
    brand: "FreshPod",
    url: "https://ops.freshpod.market/admin",
    addedBy: "usr-2",
    updatedDate: "2026-09-04",
    description: "Telemetry control tower for fleet dispatchers, delivery partners, and store hubs."
  },
  {
    id: "lnk-7",
    name: "FreshPod Instagram Creator Channel",
    category: "Social Media",
    type: "Instagram",
    subCategory: "Instagram",
    brand: "FreshPod",
    url: "https://instagram.com/freshpod_eats",
    addedBy: "usr-6",
    updatedDate: "2026-09-06",
    description: "Daily reel recipes, customer unboxings, and flash weekend promo sales."
  },
  {
    id: "lnk-15",
    name: "FreshPod Facebook Community Page",
    category: "Social Media",
    type: "Facebook",
    subCategory: "Facebook",
    brand: "FreshPod",
    url: "https://facebook.com/freshpod.official",
    addedBy: "usr-6",
    updatedDate: "2026-09-03",
    description: "Customer feedback group, recipe discussions, and community updates."
  },
  {
    id: "lnk-8",
    name: "Unit Economics & Retention Sheet",
    category: "Documents & Assets",
    type: "Google Sheets",
    subCategory: "Google Sheets",
    brand: "FreshPod",
    url: "https://docs.google.com/spreadsheets/d/1freshpod-economics",
    addedBy: "usr-2",
    updatedDate: "2026-09-01",
    description: "Cohort retention graphs, CAC vs LTV curves, and courier payment calculations."
  },

  // Lagos Project Links
  {
    id: "lnk-9",
    name: "Lagos Logistics Operations Control Center",
    category: "Websites & Portals",
    type: "Admin Panel",
    subCategory: "Admin Panel",
    brand: "Lagos",
    url: "https://telemetry.lagoslogistics.io",
    addedBy: "usr-1",
    updatedDate: "2026-08-28",
    description: "Maritime port tracking, manifest clearance API status, and warehouse metrics."
  },
  {
    id: "lnk-10",
    name: "Lagos Customs Compliance Folder",
    category: "Documents & Assets",
    type: "Google Drive",
    subCategory: "Google Drive",
    brand: "Lagos",
    url: "https://drive.google.com/drive/folders/lagos-customs-compliance",
    addedBy: "usr-7",
    updatedDate: "2026-08-10",
    description: "Bilateral trade documentation, duty tariff classifications, and insurance certificates."
  },
  {
    id: "lnk-16",
    name: "AWS Infrastructure Dashboard",
    category: "Developer Tools & Cloud",
    type: "AWS Console",
    subCategory: "AWS Console",
    brand: "Lagos",
    url: "https://console.aws.amazon.com/vpc/lagos-prod",
    addedBy: "usr-5",
    updatedDate: "2026-09-09",
    description: "ElastiCache Redis clusters, EC2 auto-scaling groups, and VPC peering connections."
  },

  // Internal Org Links
  {
    id: "lnk-11",
    name: "Engineering Handbook & Coding Standards",
    category: "Documents & Assets",
    type: "Notion",
    subCategory: "Notion",
    brand: "Internal",
    url: "https://notion.so/pulsepm-eng-handbook",
    addedBy: "usr-1",
    updatedDate: "2026-09-07",
    description: "Git branching conventions, PR review SLAs, and TypeScript architecture guidelines."
  },
  {
    id: "lnk-12",
    name: "PulsePM Design System Spec & Tokens",
    category: "Documents & Assets",
    type: "Figma",
    subCategory: "Figma",
    brand: "Internal",
    url: "https://figma.com/@pulsepm-core-system",
    addedBy: "usr-4",
    updatedDate: "2026-09-05",
    description: "Shared component tokens, color contrast checks, and motion physics specs."
  },
  {
    id: "lnk-17",
    name: "Org GitHub Repository Portal",
    category: "Developer Tools & Cloud",
    type: "GitHub / GitLab",
    subCategory: "GitHub / GitLab",
    brand: "Internal",
    url: "https://github.com/shoolin-project",
    addedBy: "usr-1",
    updatedDate: "2026-09-10",
    description: "Main source code repository, pull request pipeline, and CI action workflows."
  }
];
