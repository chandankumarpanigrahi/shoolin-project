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
import { TemplateCategory } from '../models/TemplateCategory.js';
import { Template } from '../models/Template.js';
import { Meeting } from '../models/Meeting.js';
import { Dependency } from '../models/Dependency.js';
import { Link } from '../models/Link.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

// Default Master Statuses
const DEFAULT_STATUSES = [
  { name: 'Not Started', scope: 'Global', color: 'slate', behavior: 'backlog', marksAsCompleted: false, order: 1 },
  { name: 'In Progress', scope: 'Global', color: 'indigo', behavior: 'inprogress', marksAsCompleted: false, order: 2 },
  { name: 'Under Review', scope: 'Global', color: 'amber', behavior: 'review', marksAsCompleted: false, order: 3 },
  { name: 'Blocked', scope: 'Global', color: 'rose', behavior: 'blocked', marksAsCompleted: false, order: 4 },
  { name: 'Completed', scope: 'Global', color: 'emerald', behavior: 'completed', marksAsCompleted: true, order: 5 },
];

// Default System Roles
const DEFAULT_ROLES = [
  { name: 'Super Admin', label: 'Super Admin', desc: 'Full unrestricted platform access', isSystem: true, color: 'indigo' },
  { name: 'Admin', label: 'Admin', desc: 'Project and team management access', isSystem: true, color: 'sky' },
  { name: 'Manager / TL', label: 'Manager / TL', desc: 'Project oversight and task delegation', isSystem: true, color: 'emerald' },
  { name: 'Employee', label: 'Employee', desc: 'Task execution and personal focus', isSystem: true, color: 'slate' },
  { name: 'Guest / Client', label: 'Guest / Client', desc: 'Read-only access to deliverables', isSystem: true, color: 'amber' },
];

// Default Template Categories
const DEFAULT_CATEGORIES = [
  { name: 'Web Development', color: 'indigo', icon: 'Code', description: 'Full-stack web applications and portals', order: 1 },
  { name: 'Mobile Apps', color: 'emerald', icon: 'Smartphone', description: 'iOS and Android app development sprints', order: 2 },
  { name: 'Brand & Marketing', color: 'rose', icon: 'Palette', description: 'Campaign initiatives and design systems', order: 3 },
  { name: 'Operations & Legal', color: 'amber', icon: 'Briefcase', description: 'Enterprise operations and compliance workflows', order: 4 },
];

export async function seedDatabase({ clearData = false, cleanSlateOnly = false } = {}) {
  await connectDB();
  console.log('🌱 Starting MongoDB Atlas Database Population...');

  if (clearData) {
    console.log('🧹 Clearing existing collections in MongoDB Atlas...');
    await Promise.all([
      Project.deleteMany({}),
      Task.deleteMany({}),
      Meeting.deleteMany({}),
      Dependency.deleteMany({}),
      Link.deleteMany({}),
    ]);
    console.log('✅ Projects, tasks, meetings, dependencies, and links cleared.');
  }

  // 1. Seed Master Statuses
  const statusCount = await MasterStatus.countDocuments();
  if (statusCount === 0) {
    await MasterStatus.insertMany(DEFAULT_STATUSES);
    console.log(`✅ Seeded ${DEFAULT_STATUSES.length} Master Statuses.`);
  }

  // 2. Seed Roles
  const roleCount = await Role.countDocuments();
  if (roleCount === 0) {
    await Role.insertMany(DEFAULT_ROLES);
    console.log(`✅ Seeded ${DEFAULT_ROLES.length} System Roles.`);
  }

  // 3. Seed Template Categories
  const catCount = await TemplateCategory.countDocuments();
  if (catCount === 0) {
    await TemplateCategory.insertMany(DEFAULT_CATEGORIES);
    console.log(`✅ Seeded ${DEFAULT_CATEGORIES.length} Template Categories.`);
  }

  // 4. Seed Primary Admin User
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'uxdesigner@shoolin.co.uk';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@1234!', salt);
    await User.create({
      name: 'Primary Admin',
      email: adminEmail,
      passwordHash,
      role: 'Super Admin',
      department: 'Executive Operations',
      status: 'Active',
      lastActive: new Date().toISOString(),
    });
    console.log(`✅ Created Primary Super Admin: ${adminEmail}`);
  }

  if (cleanSlateOnly) {
    console.log('✨ Clean slate ready! No demo projects or tasks inserted.');
    return { success: true, cleanSlate: true };
  }

  // If not clean slate, insert starter sample projects/tasks
  const projectCount = await Project.countDocuments();
  if (projectCount === 0 && !cleanSlateOnly) {
    const starterProject = await Project.create({
      code: 'PRJ-101',
      name: 'Enterprise Operations OS Launch',
      client: 'Shoolin Innovations Limited',
      brand: 'Shoolin',
      type: 'Core Platform',
      category: 'Software Development',
      ownerId: adminEmail,
      progress: 0,
      status: 'In Progress',
      priority: 'High',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      budget: '50000',
      description: 'Initial deployment and operational onboarding for Shoolin Innovations.',
      tasksCount: 2,
    });

    await Task.insertMany([
      {
        code: 'TSK-101-1',
        title: 'Complete System Setup & Team Onboarding',
        projectId: starterProject._id.toString(),
        assignedTo: adminEmail,
        status: 'In Progress',
        priority: 'High',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        description: 'Verify MongoDB connection and configure team roles.',
      },
      {
        code: 'TSK-101-2',
        title: 'Review Project Templates & Workflow Automations',
        projectId: starterProject._id.toString(),
        assignedTo: adminEmail,
        status: 'Not Started',
        priority: 'Medium',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        description: 'Set up sprint templates for upcoming operational initiatives.',
      },
    ]);
    console.log('✅ Seeded initial starter project and tasks in MongoDB Atlas.');
  }

  console.log('🎉 MongoDB Atlas Population Complete!');
  return { success: true };
}

// CLI runner
if (process.argv[2] === '--run') {
  const cleanSlate = process.argv.includes('--clean');
  seedDatabase({ clearData: true, cleanSlateOnly: cleanSlate })
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
