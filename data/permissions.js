// Granular 34-permission taxonomy and RBAC matrix schema across 11 functional modules

export const ROLES = ["Super Admin", "Admin", "Manager / TL", "User"];

export const INITIAL_ROLES = [
  {
    id: "role-1",
    name: "Super Admin",
    status: "Active",
    isSystem: true,
    desc: "Unrestricted master governance & security architecture"
  },
  {
    id: "role-2",
    name: "Admin",
    status: "Active",
    isSystem: true,
    desc: "Operational departmental leadership & workspace management"
  },
  {
    id: "role-3",
    name: "Manager / TL",
    status: "Active",
    isSystem: true,
    desc: "Team leadership, sprint execution & project mandate coordination"
  },
  {
    id: "role-4",
    name: "User",
    status: "Active",
    isSystem: true,
    desc: "Individual contributor & assigned task owner"
  }
];

export const PERMISSION_MODULES = [
  { id: "dashboard", name: "Dashboard & Overview", icon: "LayoutDashboard", desc: "Executive metrics, summaries, and operational stream" },
  { id: "projects", name: "Project Mandates", icon: "Briefcase", desc: "Creation, budget management, archiving, and team assignment" },
  { id: "tasks", name: "Tasks & Work Breakdown", icon: "CheckSquare", desc: "Hierarchical subtasks, status transitions, and assignments" },
  { id: "roadmap", name: "Roadmap & Gantt", icon: "CalendarRange", desc: "Quarterly timeline, milestone releases, and phases" },
  { id: "meetings", name: "Meetings & Video Sync", icon: "Video", desc: "Google Meet calendar sessions, invites, and call links" },
  { id: "dependencies", name: "Blockers & Dependencies", icon: "GitBranch", desc: "Cross-team blocker logging, hand-offs, and resolutions" },
  { id: "links", name: "Brand & Resource Links", icon: "Link2", desc: "Drive assets, Figma designs, credentials, and documentation" },
  { id: "kpi", name: "KPI Analytics & Telemetry", icon: "BarChart3", desc: "Throughput metrics, team velocity, and financial exports" },
  { id: "templates", name: "Project Templates", icon: "Layers", desc: "Reusable one-time & recurring workflow blueprints" },
  { id: "masters", name: "Master Setup Configuration", icon: "Database", desc: "Directory users, roles, statuses, brands, and departments" },
  { id: "access_control", name: "Access Control & RBAC Governance", icon: "ShieldCheck", desc: "Tit-to-bit user permission overrides and role matrix" }
];

export const GRANULAR_PERMISSIONS = [
  // 1. Dashboard
  {
    id: "dashboard.view",
    moduleId: "dashboard",
    name: "View Dashboard",
    description: "Access system overview, KPI cards, and personal focus areas",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "dashboard.financials",
    moduleId: "dashboard",
    name: "View Financial & Budget Metrics",
    description: "View financial sums, retainer allocations, and burn rates",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },
  {
    id: "dashboard.activity",
    moduleId: "dashboard",
    name: "View Organization Activity Stream",
    description: "Browse live team audit logs and milestone events",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },

  // 2. Projects
  {
    id: "projects.view",
    moduleId: "projects",
    name: "Browse Projects Catalog",
    description: "View project directory, mandate details, and scopes",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "projects.create",
    moduleId: "projects",
    name: "Create New Projects",
    description: "Initialize new one-time or recurring project mandates",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },
  {
    id: "projects.edit",
    moduleId: "projects",
    name: "Edit Project Details & Budgets",
    description: "Modify deadlines, priority, budgets, client info, and code",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },
  {
    id: "projects.delete",
    moduleId: "projects",
    name: "Delete Project Mandates",
    description: "Permanently delete projects and cascade associated tasks",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },
  {
    id: "projects.archive",
    moduleId: "projects",
    name: "Archive / Complete Projects",
    description: "Move finished projects into cold storage or archive",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },
  {
    id: "projects.assign_team",
    moduleId: "projects",
    name: "Assign Project Team Members",
    description: "Add, replace, or reassign collaborators on project mandates",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },

  // 3. Tasks
  {
    id: "tasks.view",
    moduleId: "tasks",
    name: "Browse Tasks & Subtasks",
    description: "View task boards, lists, and hierarchy breakdowns",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "tasks.create",
    moduleId: "tasks",
    name: "Create Tasks & Subtasks",
    description: "Create parent tasks, child deliverables, and subtasks",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "tasks.edit",
    moduleId: "tasks",
    name: "Edit Task Details",
    description: "Update task descriptions, tags, estimated hours, and dates",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "tasks.delete",
    moduleId: "tasks",
    name: "Delete Tasks",
    description: "Permanently remove tasks or subtask branches",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },
  {
    id: "tasks.status_change",
    moduleId: "tasks",
    name: "Update Task Status & Completion",
    description: "Transition tasks through workflow statuses or mark completed",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "tasks.assign",
    moduleId: "tasks",
    name: "Assign Tasks to Others",
    description: "Reassign task ownership to colleagues and engineers",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },

  // 4. Roadmap
  {
    id: "roadmap.view",
    moduleId: "roadmap",
    name: "View Roadmap & Gantt Timeline",
    description: "Review strategic quarterly release milestones and Gantt charts",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "roadmap.manage",
    moduleId: "roadmap",
    name: "Manage Roadmap Milestones",
    description: "Shift target milestones, reschedule phases, and set baselines",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },

  // 5. Meetings
  {
    id: "meetings.view",
    moduleId: "meetings",
    name: "View Meeting Schedule",
    description: "Browse upcoming sprint syncs, agendas, and calendar",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "meetings.schedule",
    moduleId: "meetings",
    name: "Schedule Meeting Syncs",
    description: "Book new calendar slots and create Google Meet sessions",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "meetings.cancel",
    moduleId: "meetings",
    name: "Cancel / Delete Meetings",
    description: "Cancel booked sync meetings or delete from calendar",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },

  // 6. Dependencies
  {
    id: "dependencies.view",
    moduleId: "dependencies",
    name: "View Dependency Tracker",
    description: "Track cross-team blockers, requirements, and critical paths",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "dependencies.create",
    moduleId: "dependencies",
    name: "Log Blockers & Hand-offs",
    description: "File new dependencies, blocker tickets, and request resolutions",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "dependencies.resolve",
    moduleId: "dependencies",
    name: "Resolve / Update Blockers",
    description: "Mark blockers unblocked, approve hand-offs, or change status",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },

  // 7. Links
  {
    id: "links.view",
    moduleId: "links",
    name: "View Shared Resource Links",
    description: "Access shared Google Drive, Figma files, and documentation",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "links.create",
    moduleId: "links",
    name: "Add Resource Links",
    description: "Bookmark company URLs, documentation, and cloud assets",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "links.delete",
    moduleId: "links",
    name: "Delete Shared Links",
    description: "Remove pinned resource links from the organization hub",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },

  // 8. KPI Analytics
  {
    id: "kpi.view",
    moduleId: "kpi",
    name: "View KPI Analytics",
    description: "Access velocity telemetry, team workload, and performance scores",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },
  {
    id: "kpi.export",
    moduleId: "kpi",
    name: "Export KPI Data & Reports",
    description: "Download CSV/PDF reports containing organizational throughput",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },

  // 9. Templates
  {
    id: "templates.view",
    moduleId: "templates",
    name: "View Project Templates",
    description: "Browse recurring & one-time project blueprint library",
    risk: "Low",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": true }
  },
  {
    id: "templates.create",
    moduleId: "templates",
    name: "Create & Architect Templates",
    description: "Build new standardized project trees with subtasks & milestones",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },
  {
    id: "templates.launch",
    moduleId: "templates",
    name: "Launch Mandate from Template",
    description: "Instantiate full live projects from blueprint templates",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": true, "User": false }
  },

  // 10. Masters Setup
  {
    id: "masters.access",
    moduleId: "masters",
    name: "Access Masters Setup",
    description: "Enter system configuration master dashboard",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },
  {
    id: "masters.users_manage",
    moduleId: "masters",
    name: "Manage Users & Accounts",
    description: "Invite members, edit user emails/departments, and toggle active state",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },
  {
    id: "masters.roles_manage",
    moduleId: "masters",
    name: "Manage Role Definitions",
    description: "Create, edit, and deactivate custom organizational roles",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": false, "Manager / TL": false, "User": false }
  },

  // 11. Access Control & RBAC Governance
  {
    id: "access_control.view",
    moduleId: "access_control",
    name: "View Access Control Hub",
    description: "View the tit-to-bit permissions matrix and member privileges",
    risk: "Standard",
    defaultRoles: { "Super Admin": true, "Admin": true, "Manager / TL": false, "User": false }
  },
  {
    id: "access_control.manage_roles",
    moduleId: "access_control",
    name: "Manage Role Permissions Matrix",
    description: "Adjust baseline capabilities across Super Admin, Admin, Manager, User",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": false, "Manager / TL": false, "User": false }
  },
  {
    id: "access_control.manage_users",
    moduleId: "access_control",
    name: "Override Individual User Permissions",
    description: "Configure bit-by-bit custom permission overrides for specific members",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": false, "Manager / TL": false, "User": false }
  },
  {
    id: "access_control.reset",
    moduleId: "access_control",
    name: "Reset System Governance",
    description: "Restore entire organization permissions back to factory defaults",
    risk: "High",
    defaultRoles: { "Super Admin": true, "Admin": false, "Manager / TL": false, "User": false }
  }
];

// Generate default role permissions map: { [roleName]: { [permId]: boolean } }
export const generateDefaultRolePermissions = () => {
  const result = {
    "Super Admin": {},
    "Admin": {},
    "Manager / TL": {},
    "User": {}
  };

  GRANULAR_PERMISSIONS.forEach((perm) => {
    Object.keys(result).forEach((role) => {
      // Super Admin gets true for everything by default
      if (role === "Super Admin") {
        result[role][perm.id] = true;
      } else {
        result[role][perm.id] = perm.defaultRoles[role] ?? false;
      }
    });
  });

  return result;
};

export const DEFAULT_ROLE_PERMISSIONS = generateDefaultRolePermissions();

// Legacy compatibility shim for INITIAL_PERMISSIONS
export const INITIAL_PERMISSIONS = GRANULAR_PERMISSIONS.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.moduleId,
  description: p.description,
  roles: {
    "Super Admin": "Full",
    "Admin": p.defaultRoles["Admin"] ? "Full" : "None",
    "Manager / TL": p.defaultRoles["Manager / TL"] ? "Full" : "None",
    "User": p.defaultRoles["User"] ? "Full" : "None"
  }
}));

export const ROLE_PERMISSIONS = INITIAL_PERMISSIONS;
