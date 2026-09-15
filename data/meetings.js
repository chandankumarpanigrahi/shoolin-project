// Meetings dataset with table format and statuses
export const INITIAL_MEETINGS = [
  {
    id: "mtg-1",
    title: "Sprint Alignment & Architecture Review",
    requestedBy: "usr-1", // Alex Rivera
    participants: ["usr-1", "usr-3", "usr-4", "usr-5"],
    meetUrl: "https://meet.google.com/xyz-qwe-asd",
    date: "2026-09-11",
    time: "10:30 AM",
    duration: "45 mins",
    priority: "High",
    projectId: "proj-1", // PMV-001
    relatedTaskId: "task-107", // Frontend Engineering
    description: "Deep dive into state management strategy and edge caching performance for the new homepage.",
    status: "Accepted" // "Requested" | "Accepted" | "Declined" | "Rescheduled" | "Completed"
  },
  {
    id: "mtg-2",
    title: "Client Design Sign-Off: Mobile App UI",
    requestedBy: "usr-4", // Priya Patel
    participants: ["usr-1", "usr-2", "usr-4"],
    meetUrl: "https://meet.google.com/fgh-jkl-vbn",
    date: "2026-09-12",
    time: "02:00 PM",
    duration: "60 mins",
    priority: "Urgent",
    projectId: "proj-2", // FreshPod
    relatedTaskId: "task-202",
    description: "Walkthrough of checkout edge cases, Apple Pay authorization modals, and refund receipts.",
    status: "Requested"
  },
  {
    id: "mtg-3",
    title: "Weekly SEO & Traffic Velocity Sync",
    requestedBy: "usr-6", // Elena Rostova
    participants: ["usr-2", "usr-6", "usr-5"],
    meetUrl: "https://meet.google.com/iop-ert-uio",
    date: "2026-09-14",
    time: "11:00 AM",
    duration: "30 mins",
    priority: "Medium",
    projectId: "proj-5", // SEO
    relatedTaskId: null,
    description: "Review keyword rank jumps from the technical crawl remediation and schema markup rollout.",
    status: "Accepted"
  },
  {
    id: "mtg-4",
    title: "Stripe Webhook Blocker Triage",
    requestedBy: "usr-5", // Marcus Vance
    participants: ["usr-3", "usr-5", "usr-7"],
    meetUrl: "https://meet.google.com/bnm-asd-qwe",
    date: "2026-09-10",
    time: "04:15 PM",
    duration: "25 mins",
    priority: "Urgent",
    projectId: "proj-2",
    relatedTaskId: "task-202",
    description: "Resolve test mode signature verification errors on idempotent subscription renewals.",
    status: "Rescheduled"
  },
  {
    id: "mtg-5",
    title: "Monthly Financial Performance Audit",
    requestedBy: "usr-2", // Sarah Chen
    participants: ["usr-1", "usr-2", "usr-7"],
    meetUrl: "https://meet.google.com/qwe-rty-uio",
    date: "2026-09-05",
    time: "03:00 PM",
    duration: "50 mins",
    priority: "Low",
    projectId: "proj-7",
    relatedTaskId: null,
    description: "P&L variance analysis across African regional corridors and currency hedges.",
    status: "Completed"
  }
];
