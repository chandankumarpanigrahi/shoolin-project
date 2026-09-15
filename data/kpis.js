// KPI Analytics data structure for Project, Task, User, and Team performance
export const KPI_DATA = {
  overview: {
    activeProjects: 6,
    tasksDueToday: 4,
    overdueTasks: 2,
    completedTasks: 84,
    teamMembers: 7,
    pendingMeetings: 3,
    avgCompletionDays: "18.4 days",
    onTimeDeliveryRate: "94.2%",
    totalBudgetUnderMgmt: "$232,000"
  },

  projectKPIs: {
    created: 14,
    completed: 7,
    inProgress: 5,
    delayed: 2,
    successRate: 91.5,
    avgCycleDays: 42
  },

  taskKPIs: {
    totalAssigned: 142,
    completed: 108,
    inProgress: 24,
    pendingReview: 6,
    overdue: 4,
    completionRate: 76.1,
    avgResolutionHours: 28.5
  },

  monthlyTrends: [
    { month: "Apr", completed: 18, inProgress: 12, pending: 8, overdue: 3 },
    { month: "May", completed: 24, inProgress: 14, pending: 6, overdue: 2 },
    { month: "Jun", completed: 28, inProgress: 16, pending: 7, overdue: 1 },
    { month: "Jul", completed: 32, inProgress: 19, pending: 5, overdue: 4 },
    { month: "Aug", completed: 38, inProgress: 21, pending: 9, overdue: 2 },
    { month: "Sep", completed: 42, inProgress: 18, pending: 6, overdue: 2 }
  ],

  userProductivity: [
    {
      userId: "usr-1",
      name: "Alex Rivera",
      assigned: 16,
      completed: 14,
      overdue: 0,
      completionRate: 87.5,
      trend: "+12%"
    },
    {
      userId: "usr-2",
      name: "Sarah Chen",
      assigned: 22,
      completed: 19,
      overdue: 1,
      completionRate: 86.4,
      trend: "+8%"
    },
    {
      userId: "usr-3",
      name: "Rahul Sharma",
      assigned: 26,
      completed: 21,
      overdue: 1,
      completionRate: 80.8,
      trend: "+15%"
    },
    {
      userId: "usr-4",
      name: "Priya Patel",
      assigned: 20,
      completed: 18,
      overdue: 0,
      completionRate: 90.0,
      trend: "+6%"
    },
    {
      userId: "usr-5",
      name: "Marcus Vance",
      assigned: 24,
      completed: 18,
      overdue: 2,
      completionRate: 75.0,
      trend: "+4%"
    },
    {
      userId: "usr-6",
      name: "Elena Rostova",
      assigned: 18,
      completed: 15,
      overdue: 0,
      completionRate: 83.3,
      trend: "+9%"
    },
    {
      userId: "usr-7",
      name: "David Kim",
      assigned: 16,
      completed: 13,
      overdue: 0,
      completionRate: 81.3,
      trend: "+11%"
    }
  ],

  teamWorkload: [
    { department: "Engineering", capacity: 88, activeTasks: 31, health: "Optimal" },
    { department: "Design & UX", capacity: 74, activeTasks: 18, health: "Balanced" },
    { department: "Marketing", capacity: 65, activeTasks: 12, health: "Available" },
    { department: "Operations & QA", capacity: 92, activeTasks: 15, health: "Near Capacity" }
  ],

  weeklyHeatmap: [
    { day: "Mon", tasksClosed: 14, commits: 42, meetings: 6 },
    { day: "Tue", tasksClosed: 19, commits: 58, meetings: 4 },
    { day: "Wed", tasksClosed: 23, commits: 64, meetings: 5 },
    { day: "Thu", tasksClosed: 26, commits: 71, meetings: 3 },
    { day: "Fri", tasksClosed: 18, commits: 49, meetings: 2 }
  ]
};

export const KPI_METRICS = {
  onTimeDeliveryRate: 94.2,
  taskCompletionRate: 76.1,
  dependencyResolutionTime: "1.4 days",
  teamProductivityScore: 92,
  monthlyCompletionTrend: [
    { month: "Apr", completed: 18 },
    { month: "May", completed: 24 },
    { month: "Jun", completed: 28 },
    { month: "Jul", completed: 32 },
    { month: "Aug", completed: 38 },
    { month: "Sep", completed: 42 }
  ]
};

