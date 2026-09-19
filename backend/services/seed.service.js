import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db/connect.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { MasterStatus } from '../models/MasterStatus.js';
import { Role } from '../models/Role.js';
import { RolePermission } from '../models/RolePermission.js';
import { UserOverride } from '../models/UserOverride.js';
import { AuditLog } from '../models/AuditLog.js';
import { TemplateCategory } from '../models/TemplateCategory.js';
import { Template } from '../models/Template.js';
import { Meeting } from '../models/Meeting.js';
import { Dependency } from '../models/Dependency.js';
import { Link } from '../models/Link.js';

// Static Data Imports
import { PROJECTS } from '../../data/projects.js';
import { INITIAL_TASKS } from '../../data/tasks.js';
import { USERS } from '../../data/users.js';
import { INITIAL_MEETINGS } from '../../data/meetings.js';
import { INITIAL_DEPENDENCIES } from '../../data/dependencies.js';
import { INITIAL_LINKS } from '../../data/links.js';
import { TEMPLATES, DEFAULT_BLUEPRINT_CATEGORIES } from '../../data/templates.js';
import { DEFAULT_MASTER_STATUSES } from '../../data/statuses.js';
import { INITIAL_ROLES, DEFAULT_ROLE_PERMISSIONS } from '../../data/permissions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

export async function seedDatabase({ clearData = true } = {}) {
  await connectDB();
  console.log('🌱 Starting Full MongoDB Atlas Dataset Population...');

  if (clearData) {
    console.log('🧹 Clearing existing collections in MongoDB Atlas...');
    await Promise.all([
      Project.deleteMany({}),
      Task.deleteMany({}),
      Meeting.deleteMany({}),
      Dependency.deleteMany({}),
      Link.deleteMany({}),
      User.deleteMany({}),
      Role.deleteMany({}),
      RolePermission.deleteMany({}),
      UserOverride.deleteMany({}),
      MasterStatus.deleteMany({}),
      TemplateCategory.deleteMany({}),
      Template.deleteMany({}),
    ]);
    console.log('✅ Collections cleared successfully.');
  }

  // 1. Seed Master Statuses
  await MasterStatus.insertMany(
    DEFAULT_MASTER_STATUSES.map((s, idx) => ({
      name: s.name,
      scope: s.scope || 'Global',
      color: s.color || 'indigo',
      behavior: s.behavior || 'inprogress',
      marksAsCompleted: !!s.marksAsCompleted,
      order: s.order || idx + 1,
    }))
  );
  console.log(`✅ Seeded ${DEFAULT_MASTER_STATUSES.length} Master Statuses.`);

  // 2. Seed System Roles
  await Role.insertMany(
    INITIAL_ROLES.map((r) => ({
      name: r.name,
      label: r.name,
      desc: r.desc || '',
      color: 'indigo',
      isSystem: !!r.isSystem,
    }))
  );
  console.log(`✅ Seeded ${INITIAL_ROLES.length} System Roles.`);

  // 3. Seed Tit-to-Bit Role Permissions Matrix
  const rolePermDocs = Object.keys(DEFAULT_ROLE_PERMISSIONS).map((roleName) => ({
    roleName,
    permissions: DEFAULT_ROLE_PERMISSIONS[roleName],
  }));
  await RolePermission.insertMany(rolePermDocs);
  console.log(`✅ Seeded ${rolePermDocs.length} Role Permission Matrices in MongoDB Atlas.`);

  // 4. Seed Template Categories
  const catDocs = DEFAULT_BLUEPRINT_CATEGORIES.map((cat, idx) => ({
    name: cat.name,
    color: cat.color || 'indigo',
    icon: cat.icon || 'Code',
    description: cat.description || '',
    order: idx + 1,
  }));
  await TemplateCategory.insertMany(catDocs);

  // 5. Seed Users
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Admin@1234!', salt);
  const userDocs = USERS.map((u) => ({
    name: u.name,
    email: u.email,
    passwordHash: defaultPasswordHash,
    role: u.role || 'Employee',
    department: u.department || 'Operations',
    avatar: u.avatar || '',
    phone: u.phone || '',
    status: u.status || 'Active',
    lastActive: new Date().toISOString(),
  }));
  await User.insertMany(userDocs);
  console.log(`✅ Seeded ${userDocs.length} Directory Users in MongoDB Atlas.`);

  // 6. Seed Projects
  const projDocs = PROJECTS.map((p) => ({
    code: p.code || p.id,
    name: p.name,
    client: p.client || 'Shoolin Innovations',
    brand: p.brand || 'Shoolin',
    type: p.type || 'one-time',
    category: p.category || 'General',
    ownerId: p.owner || 'admin@shoolin.co.uk',
    managerId: p.manager || '',
    teamIds: p.team || [],
    progress: p.progress || 0,
    status: p.status || 'In Progress',
    priority: p.priority || 'Medium',
    startDate: p.startDate || new Date().toISOString().split('T')[0],
    targetDate: p.targetDate || new Date().toISOString().split('T')[0],
    budget: p.budget || '0',
    description: p.description || '',
    tasksCount: p.tasksCount || 0,
    completedTasksCount: p.completedTasksCount || 0,
  }));
  const createdProjects = await Project.insertMany(projDocs);
  console.log(`✅ Seeded ${createdProjects.length} Projects in MongoDB Atlas.`);

  // Map project code/id to actual Mongo ObjectId string
  const projMap = {};
  createdProjects.forEach((cp, idx) => {
    const origId = PROJECTS[idx].id;
    projMap[origId] = cp._id.toString();
    projMap[cp.code] = cp._id.toString();
  });

  // 7. Seed Tasks
  const taskDocs = INITIAL_TASKS.map((t) => ({
    code: t.code || t.id,
    title: t.title,
    projectId: projMap[t.projectId] || t.projectId,
    parentId: t.parentId ? projMap[t.parentId] || t.parentId : null,
    level: t.level || 0,
    assignedTo: t.assignedTo || 'admin@shoolin.co.uk',
    status: t.status || 'Not Started',
    priority: t.priority || 'Medium',
    targetDate: t.targetDate || '',
    createdDate: t.createdDate || new Date().toISOString(),
    createdBy: t.createdBy || 'usr-1',
    description: t.description || '',
    dependencies: t.dependencies || [],
  }));
  await Task.insertMany(taskDocs);
  console.log(`✅ Seeded ${taskDocs.length} Hierarchical Tasks in MongoDB Atlas.`);

  // 8. Seed Meetings
  const meetingDocs = INITIAL_MEETINGS.map((m) => ({
    title: m.title,
    requestedBy: m.organizer || m.requestedBy || 'usr-1',
    participantIds: m.participants || m.participantIds || [],
    meetUrl: m.meetUrl || 'https://meet.google.com/abc-defg-hij',
    date: m.date || new Date().toISOString().split('T')[0],
    duration: m.duration || '30m',
    priority: m.priority || 'Medium',
    projectId: projMap[m.projectId] || m.projectId || '',
    description: m.description || '',
    status: m.status || 'Scheduled',
  }));
  await Meeting.insertMany(meetingDocs);
  console.log(`✅ Seeded ${meetingDocs.length} Meetings in MongoDB Atlas.`);

  // 9. Seed Dependencies
  const depDocs = INITIAL_DEPENDENCIES.map((d) => ({
    fromUserId: d.fromUserId || d.blockedUser || 'usr-1',
    toUserId: d.toUserId || d.dependentUser || 'usr-2',
    relatedTaskId: d.relatedTaskId || d.taskId || 'task-100',
    projectId: projMap[d.projectId] || d.projectId || createdProjects[0]._id.toString(),
    dependencyDescription: d.dependencyDescription || d.title || 'Blocker Task',
    status: d.status || 'Pending',
    expectedDate: d.expectedDate || '',
    details: d.details || '',
  }));
  await Dependency.insertMany(depDocs);
  console.log(`✅ Seeded ${depDocs.length} Dependency Blockers in MongoDB Atlas.`);

  // 10. Seed Links
  const linkDocs = INITIAL_LINKS.map((l) => ({
    name: l.name || l.title,
    url: l.url,
    category: l.category || 'General',
    type: l.type || 'Tool',
    subCategory: l.subCategory || '',
    brand: l.brand || 'All',
    addedBy: l.addedBy || 'usr-1',
    description: l.description || '',
  }));
  await Link.insertMany(linkDocs);
  console.log(`✅ Seeded ${linkDocs.length} Resource Links in MongoDB Atlas.`);

  // 11. Seed Templates
  const templateDocs = TEMPLATES.map((tmpl) => ({
    name: tmpl.name,
    description: tmpl.description || '',
    category: tmpl.category || 'Software Development',
    tasksTree: tmpl.tasksTree || tmpl.tasks || [],
    taskCount: tmpl.taskCount || 0,
    type: tmpl.type || 'Standard',
    isDefault: true,
  }));
  await Template.insertMany(templateDocs);
  console.log(`✅ Seeded ${templateDocs.length} Project Templates in MongoDB Atlas.`);

  console.log('🎉 Full MongoDB Atlas Dataset Population Complete!');
  return { success: true };
}

// CLI runner
if (process.argv[2] === '--run') {
  seedDatabase({ clearData: true })
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    });
}
