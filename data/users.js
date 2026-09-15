// User directory with realistic roles, avatars, and departments
export const USERS = [
  {
    id: "usr-1",
    name: "Alex Rivera",
    email: "alex.rivera@pulsepm.io",
    role: "Super Admin",
    department: "Executive & Tech Lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 234-5678",
    activeTasks: 8,
    projectsCount: 6,
    status: "Active",
    lastActive: "Just now"
  },
  {
    id: "usr-2",
    name: "Sarah Chen",
    email: "sarah.chen@pulsepm.io",
    role: "Admin",
    department: "Project Operations",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 345-6789",
    activeTasks: 12,
    projectsCount: 7,
    status: "Active",
    lastActive: "10m ago"
  },
  {
    id: "usr-3",
    name: "Rahul Sharma",
    email: "rahul.sharma@pulsepm.io",
    role: "Manager / TL",
    department: "Backend Engineering",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 456-7890",
    activeTasks: 14,
    projectsCount: 5,
    status: "Active",
    lastActive: "25m ago"
  },
  {
    id: "usr-4",
    name: "Priya Patel",
    email: "priya.patel@pulsepm.io",
    role: "Manager / TL",
    department: "UI/UX & Product Design",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 567-8901",
    activeTasks: 9,
    projectsCount: 4,
    status: "Active",
    lastActive: "1h ago"
  },
  {
    id: "usr-5",
    name: "Marcus Vance",
    email: "marcus.vance@pulsepm.io",
    role: "User",
    department: "Frontend Engineering",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 678-9012",
    activeTasks: 11,
    projectsCount: 3,
    status: "Active",
    lastActive: "3h ago"
  },
  {
    id: "usr-6",
    name: "Elena Rostova",
    email: "elena.rostova@pulsepm.io",
    role: "User",
    department: "Marketing & Social",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 789-0123",
    activeTasks: 7,
    projectsCount: 4,
    status: "Away",
    lastActive: "Yesterday"
  },
  {
    id: "usr-7",
    name: "David Kim",
    email: "david.kim@pulsepm.io",
    role: "User",
    department: "QA & DevOps",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    phone: "+1 (555) 890-1234",
    activeTasks: 6,
    projectsCount: 3,
    status: "Active",
    lastActive: "4h ago"
  }
];

export const CURRENT_USER_DEFAULT = USERS[0]; // Super Admin by default
