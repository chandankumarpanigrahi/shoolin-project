// Project Templates dataset with pre-structured recursive task breakdowns
// Supports unlimited depth nesting: Task > Sub-task > Sub-task > Sub-task > Sub-task...

export function countTreeNodes(tree) {
  if (!tree || !Array.isArray(tree)) return 0;
  let count = 0;
  function traverse(nodes) {
    for (const node of nodes) {
      count++;
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(tree);
  return count;
}

export function getMaxTreeDepth(tree) {
  if (!tree || !Array.isArray(tree) || tree.length === 0) return 0;
  function getDepth(node) {
    if (!node.children || node.children.length === 0) return 1;
    let maxChild = 0;
    for (const child of node.children) {
      const d = getDepth(child);
      if (d > maxChild) maxChild = d;
    }
    return 1 + maxChild;
  }
  let max = 0;
  for (const node of tree) {
    const d = getDepth(node);
    if (d > max) max = d;
  }
  return max;
}

export function flattenTreeToTasks(tree, projectId, projectCode) {
  const result = [];
  function traverse(nodes, parentId = null, codePrefix = projectCode, level = 1) {
    nodes.forEach((node, index) => {
      const taskId = `task-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const taskCode = `${codePrefix}.${index + 1}`;
      const taskObj = {
        id: taskId,
        projectId: projectId,
        code: taskCode,
        title: node.title,
        parentId: parentId,
        level: level,
        status: 'Not Started',
        priority: node.priority || 'Medium',
        progress: 0,
        assigneeId: null,
        startDate: '2026-09-15',
        dueDate: '2026-10-30',
        weight: 1,
        description: node.description || `Task generated from blueprint template: ${node.title}`,
        dependencies: [],
        subtasks: []
      };
      result.push(taskObj);
      if (node.children && node.children.length > 0) {
        traverse(node.children, taskId, taskCode, level + 1);
      }
    });
  }
  traverse(tree);
  return result;
}

export const TEMPLATES = [
  // One-Time Templates
  {
    id: "tmpl-1",
    name: "Enterprise Website Development",
    type: "one-time",
    category: "Website Development",
    tasksCount: 22,
    defaultDuration: "90 Days",
    createdBy: "usr-1",
    lastUpdated: "2026-08-15",
    description: "Standard end-to-end web deployment blueprint including wireframes, design tokens, frontend engineering, backend integrations, and SEO audits.",
    tasksTree: [
      {
        id: "n-1-1",
        title: "Discovery & Information Architecture",
        children: [
          {
            id: "n-1-1-1",
            title: "Stakeholder Technical Interviews",
            children: [
              {
                id: "n-1-1-1-1",
                title: "Security & Compliance Requirements",
                children: [
                  {
                    id: "n-1-1-1-1-1",
                    title: "OAuth & SAML Identity Mapping",
                    children: [
                      {
                        id: "n-1-1-1-1-1-1",
                        title: "Multi-tenant JWT token rotation specs",
                        children: []
                      }
                    ]
                  }
                ]
              },
              {
                id: "n-1-1-1-2",
                title: "Data Migration Scope & Strategy",
                children: []
              }
            ]
          },
          {
            id: "n-1-1-2",
            title: "Sitemap & User Journey Flows",
            children: [
              {
                id: "n-1-1-2-1",
                title: "High-level Navigation Taxonomies",
                children: []
              }
            ]
          }
        ]
      },
      {
        id: "n-1-2",
        title: "Design System & Figma Prototypes",
        children: [
          {
            id: "n-1-2-1",
            title: "Design Tokens (Color, Typography, Elevation)",
            children: [
              {
                id: "n-1-2-1-1",
                title: "Dark & Light Mode Palette Contrast Audits",
                children: []
              }
            ]
          },
          {
            id: "n-1-2-2",
            title: "Interactive Clickable Prototype",
            children: []
          }
        ]
      },
      {
        id: "n-1-3",
        title: "Frontend Engineering & Component Setup",
        children: [
          {
            id: "n-1-3-1",
            title: "Responsive Navigation & Header Drawer",
            children: []
          },
          {
            id: "n-1-3-2",
            title: "Dynamic KPI Dashboard Layouts",
            children: []
          }
        ]
      },
      {
        id: "n-1-4",
        title: "CMS & Backend API Integration",
        children: [
          {
            id: "n-1-4-1",
            title: "Headless CMS Webhooks & Schema",
            children: []
          },
          {
            id: "n-1-4-2",
            title: "Stripe Payment Gateway Integration",
            children: []
          }
        ]
      },
      {
        id: "n-1-5",
        title: "Production Cutover & Launch",
        children: [
          {
            id: "n-1-5-1",
            title: "DNS Cutover & SSL Cert Setup",
            children: []
          },
          {
            id: "n-1-5-2",
            title: "Post-launch Smoke Testing",
            children: []
          }
        ]
      }
    ],
    tasksPreview: [
      "Discovery > Stakeholder Interviews > Compliance > OAuth Mapping",
      "Design System > Tokens > Contrast Audits",
      "Frontend Engineering > Components > Dashboard Layouts",
      "CMS & Backend API Integration > Stripe Gateway",
      "Production Cutover & Launch > DNS & SSL"
    ]
  },
  {
    id: "tmpl-2",
    name: "Mobile App Product Sprint",
    type: "one-time",
    category: "Mobile App Development",
    tasksCount: 34,
    defaultDuration: "120 Days",
    createdBy: "usr-3",
    lastUpdated: "2026-08-10",
    description: "Battle-tested React Native / Flutter architecture template with auth, push notifications, offline storage, and in-app purchases.",
    tasksTree: [
      {
        id: "n-2-1",
        title: "App Architecture & State Management",
        children: [
          {
            id: "n-2-1-1",
            title: "Offline SQLite & Sync Engine",
            children: [
              {
                id: "n-2-1-1-1",
                title: "Conflict Resolution Algorithm",
                children: [
                  {
                    id: "n-2-1-1-1-1",
                    title: "Timestamp-based Vector Clock Validation",
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "n-2-2",
        title: "Authentication & Biometrics",
        children: [
          {
            id: "n-2-2-1",
            title: "FaceID & TouchID Keychain Store",
            children: []
          },
          {
            id: "n-2-2-2",
            title: "SMS OTP Fallback Service",
            children: []
          }
        ]
      },
      {
        id: "n-2-3",
        title: "Push Notifications & Deep Linking",
        children: [
          {
            id: "n-2-3-1",
            title: "APNs & FCM Remote Service",
            children: []
          }
        ]
      },
      {
        id: "n-2-4",
        title: "App Store & Play Store Submissions",
        children: [
          {
            id: "n-2-4-1",
            title: "TestFlight External Beta Release",
            children: []
          }
        ]
      }
    ],
    tasksPreview: [
      "Architecture > Offline SQLite > Conflict Resolution > Vector Clocks",
      "Authentication > FaceID & TouchID Keychain Store",
      "Push Notifications > APNs & FCM Remote Service",
      "Store Submissions > TestFlight Beta Release"
    ]
  },
  {
    id: "tmpl-3",
    name: "Full Brand Identity & Guidelines",
    type: "one-time",
    category: "Branding",
    tasksCount: 16,
    defaultDuration: "45 Days",
    createdBy: "usr-4",
    lastUpdated: "2026-07-28",
    description: "Complete visual branding package: logo exploration, typography pairing, color psychology palette, stationery, and guidelines deck.",
    tasksTree: [
      {
        id: "n-3-1",
        title: "Brand Strategy & Positioning",
        children: [
          {
            id: "n-3-1-1",
            title: "Competitive Landscape Audit",
            children: []
          },
          {
            id: "n-3-1-2",
            title: "Moodboards & Visual Territories",
            children: []
          }
        ]
      },
      {
        id: "n-3-2",
        title: "Logo System & Marks",
        children: [
          {
            id: "n-3-2-1",
            title: "3 Vector Mark Exploration Concepts",
            children: []
          },
          {
            id: "n-3-2-2",
            title: "Responsive Scalability (Favicon to Billboard)",
            children: []
          }
        ]
      },
      {
        id: "n-3-3",
        title: "Brand Style Guide Documentation",
        children: [
          {
            id: "n-3-3-1",
            title: "Typography Pairings & Leading Rules",
            children: []
          },
          {
            id: "n-3-3-2",
            title: "Color Psychology & Token Specifications",
            children: []
          }
        ]
      }
    ],
    tasksPreview: [
      "Brand Strategy > Competitive Landscape > Moodboards",
      "Logo System > Vector Concepts > Responsive Scalability",
      "Style Guide > Typography Rules > Color Token Specs"
    ]
  },
  {
    id: "tmpl-4",
    name: "UI/UX Product Sprint",
    type: "one-time",
    category: "UI/UX Project",
    tasksCount: 18,
    defaultDuration: "30 Days",
    createdBy: "usr-4",
    lastUpdated: "2026-08-20",
    description: "Rapid prototyping sprint to validate new SaaS feature concepts with interactive usability testing sessions.",
    tasksTree: [
      {
        id: "n-4-1",
        title: "Problem Statement & Persona Discovery",
        children: [
          {
            id: "n-4-1-1",
            title: "5 In-depth Customer Interviews",
            children: []
          }
        ]
      },
      {
        id: "n-4-2",
        title: "Rapid Wireframing & Crazy Eights",
        children: [
          {
            id: "n-4-2-1",
            title: "Low-fidelity Mobile Wireframes",
            children: []
          }
        ]
      },
      {
        id: "n-4-3",
        title: "Interactive Figma Prototype",
        children: [
          {
            id: "n-4-3-1",
            title: "Micro-interactions & State Transitions",
            children: []
          }
        ]
      },
      {
        id: "n-4-4",
        title: "Usability Testing & Hand-off Synthesis",
        children: [
          {
            id: "n-4-4-1",
            title: "Synthesized Action Items Report",
            children: []
          }
        ]
      }
    ],
    tasksPreview: [
      "Problem Statement > 5 Customer Interviews",
      "Wireframing > Low-fidelity Mobile Wireframes",
      "Prototype > Micro-interactions & State Transitions",
      "Usability Testing > Synthesis Report"
    ]
  },

  // Recurring Templates
  {
    id: "tmpl-5",
    name: "Social Media Management Retainer",
    type: "recurring",
    category: "Social Media Management",
    tasksCount: 15,
    defaultDuration: "Monthly (30 Days)",
    createdBy: "usr-6",
    lastUpdated: "2026-09-01",
    description: "Monthly recurring cycle for omnichannel social content planning, reel production, copywriting, and monthly analytics reporting.",
    tasksTree: [
      {
        id: "n-5-1",
        title: "Monthly Content Strategy & Calendar",
        children: [
          {
            id: "n-5-1-1",
            title: "Hook Research & Viral Angle Ideation",
            children: [
              {
                id: "n-5-1-1-1",
                title: "TikTok & Reels Audio Trend Curation",
                children: []
              }
            ]
          }
        ]
      },
      {
        id: "n-5-2",
        title: "Graphic Asset Production",
        children: [
          {
            id: "n-5-2-1",
            title: "12 Educational Carousels (Figma/Canva)",
            children: []
          },
          {
            id: "n-5-2-2",
            title: "Story Engagements & Poll Templates",
            children: []
          }
        ]
      },
      {
        id: "n-5-3",
        title: "Video Editing & Captions",
        children: [
          {
            id: "n-5-3-1",
            title: "8 Short-form Reels (CapCut/Premiere)",
            children: []
          }
        ]
      },
      {
        id: "n-5-4",
        title: "Scheduling & Monthly Reporting",
        children: [
          {
            id: "n-5-4-1",
            title: "Buffer / Meta Business Suite Publishing",
            children: []
          },
          {
            id: "n-5-4-2",
            title: "Monthly Reach & Engagement Analytics Deck",
            children: []
          }
        ]
      }
    ],
    tasksPreview: [
      "Strategy > Hook Research > Audio Trend Curation",
      "Graphic Production > 12 Carousels > Story Polls",
      "Video Editing > 8 Short-form Reels",
      "Publishing & Monthly Reach Report"
    ]
  },
  {
    id: "tmpl-6",
    name: "Monthly Technical SEO & Content Engine",
    type: "recurring",
    category: "SEO",
    tasksCount: 12,
    defaultDuration: "Monthly (30 Days)",
    createdBy: "usr-2",
    lastUpdated: "2026-08-25",
    description: "Routine monthly crawl audits, 4 pillar blog posts, broken backlink outreach, and Google Search Console metric monitoring.",
    tasksTree: [
      {
        id: "n-6-1",
        title: "Technical Site Crawl & Core Web Vitals",
        children: [
          {
            id: "n-6-1-1",
            title: "Screaming Frog 404 & Redirect Chain Clean-up",
            children: []
          }
        ]
      },
      {
        id: "n-6-2",
        title: "Content Production Pipeline",
        children: [
          {
            id: "n-6-2-1",
            title: "Keyword Gap Analysis via Ahrefs",
            children: []
          },
          {
            id: "n-6-2-2",
            title: "4 Pillar Articles Drafted & Proofread",
            children: []
          }
        ]
      },
      {
        id: "n-6-3",
        title: "Backlink Outreach & Executive Reporting",
        children: [
          {
            id: "n-6-3-1",
            title: "Google Search Console Organic Traffic Report",
            children: []
          }
        ]
      }
    ],
    tasksPreview: [
      "Technical Audit > Screaming Frog Crawl > 404 Clean-up",
      "Content Pipeline > Keyword Gap Analysis > 4 Pillar Articles",
      "Reporting > Google Search Console Organic Progression"
    ]
  }
];
