// Dependencies dataset communicating "Who needs to provide what to whom?"
export const INITIAL_DEPENDENCIES = [
  {
    id: "dep-1",
    fromUser: "usr-3", // Rahul Sharma (Backend)
    toUser: "usr-5", // Marcus Vance (Frontend)
    taskTitle: "Apple Pay & Stripe Checkout Flow",
    relatedTaskId: "task-202", // Clickable task ID
    relatedTaskCode: "FPD-102.2",
    dependencyDescription: "Requires Stripe webhook secret & backend signature token validation endpoint",
    status: "Waiting", // "Waiting" | "In Progress" | "Resolved" | "Blocked"
    expectedDate: "2026-09-18",
    projectId: "proj-2",
    projectName: "FreshPod Mobile App 2.0",
    details: "Marcus is blocked on completing the native Apple Pay callback handler until Rahul deploys the ephemeral transaction verification token endpoint."
  },
  {
    id: "dep-2",
    fromUser: "usr-4", // Priya Patel (Design)
    toUser: "usr-5", // Marcus Vance (Frontend)
    taskTitle: "Homepage Component Implementation",
    relatedTaskId: "task-108",
    relatedTaskCode: "PMV-001.2.1",
    dependencyDescription: "Requires finalized SVG icon vector exports and 3D globe assets",
    status: "Resolved",
    expectedDate: "2026-08-22",
    projectId: "proj-1",
    projectName: "Enterprise Core Website Redesign",
    details: "All assets delivered in Figma; tokens successfully converted to Tailwind classes."
  },
  {
    id: "dep-3",
    fromUser: "usr-7", // David Kim (DevOps)
    toUser: "usr-3", // Rahul Sharma (Backend)
    taskTitle: "Database Indexing & Edge Caching",
    relatedTaskId: "task-112",
    relatedTaskCode: "PMV-001.3.2",
    dependencyDescription: "Waiting for AWS ElastiCache Redis cluster VPC peering approval",
    status: "In Progress",
    expectedDate: "2026-09-24",
    projectId: "proj-1",
    projectName: "Enterprise Core Website Redesign",
    details: "Security team needs to approve IAM security group inbound rule for port 6379."
  },
  {
    id: "dep-4",
    fromUser: "usr-2", // Sarah Chen (Admin)
    toUser: "usr-6", // Elena Rostova (Marketing)
    taskTitle: "October Editorial Calendar & Asset Prep",
    relatedTaskId: "task-300",
    relatedTaskCode: "REC-201.1",
    dependencyDescription: "Requires Q4 corporate brand messaging guidelines & promo codes",
    status: "Blocked",
    expectedDate: "2026-09-16",
    projectId: "proj-3",
    projectName: "Social Media & Growth Marketing",
    details: "Promo codes pending sign-off from finance to ensure margin thresholds are respected."
  },
  {
    id: "dep-5",
    fromUser: "usr-3", // Rahul Sharma
    toUser: "usr-1", // Alex Rivera (Lead)
    taskTitle: "Real-Time Telemetry & GPS Tracking",
    relatedTaskId: "task-200",
    relatedTaskCode: "FPD-102.1",
    dependencyDescription: "Requires load testing approval on 10,000 concurrent WebSocket connections",
    status: "In Progress",
    expectedDate: "2026-09-21",
    projectId: "proj-2",
    projectName: "FreshPod Mobile App 2.0",
    details: "Simulated load generated via k6 scripts; memory footprint stable under 450MB."
  }
];
