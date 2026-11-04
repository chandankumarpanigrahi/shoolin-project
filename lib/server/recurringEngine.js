import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Template } from '../models/Template.js';
import { AuditLog } from '../models/AuditLog.js';
import { RealtimeEvent } from '../models/RealtimeEvent.js';
import { countTreeNodes, flattenTreeToTasks } from '../../data/templates.js';

const escapeRegex = (value = '') => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Clean helper to format or update project title with target month:
 * e.g. "Technical Content Engine (October 2026)" -> "Technical Content Engine (November 2026)"
 */
export function formatProjectCycleName(baseName = '', targetMonthYear = '') {
  const cleaned = String(baseName || '')
    .replace(/\s*\([A-Za-z]+(?:\s+\d{4})?\)$/, '')
    .trim();
  return `${cleaned || 'Recurring Sprint'} (${targetMonthYear})`;
}

export function formatDateIso(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Calculate the next cutoff date ISO string given a base date and monthly day (1-31).
 */
export function calculateNextCycleDate(baseDate = new Date(), monthlyDay = 1) {
  const d = new Date(baseDate);
  const day = Math.min(Math.max(Number(monthlyDay) || 1, 1), 28); // Safe day of month
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, day, 12, 0, 0);
  return formatDateIso(nextMonth);
}

/**
 * Check if an ACTIVE (non-deleted) cycle project already exists for this project/brand/template in the target month.
 */
export async function doesActiveCycleExist(project, targetMonthYear) {
  if (!project || !targetMonthYear) return null;

  const targetMonthYearStr = String(targetMonthYear).trim();
  const monthWord = targetMonthYearStr.split(' ')[0]; // e.g. "November"
  const cleanTitle = String(project.name || '')
    .replace(/\s*\([A-Za-z]+(?:\s+\d{4})?\)$/, '')
    .trim();

  // Match either "(November 2026)" or "(November)" or word-bounded "November"
  const monthRegex = new RegExp(`(\\b|\\()${escapeRegex(monthWord)}(\\s+\\d{4})?(\\)|\\b)`, 'i');
  const titleRegex = new RegExp(escapeRegex(cleanTitle), 'i');

  const projectId = project._id || project.id;

  // 1. Check if the project being queried is itself literally named with this target month
  const selfMatchesMonth = project.name && monthRegex.test(project.name);
  if (selfMatchesMonth && !project.isDeleted && project.status !== 'Deleted') {
    return project;
  }

  // 2. Query any other active non-deleted project matching the brand/client, title, and target month
  const query = {
    ...(projectId ? { _id: { $ne: projectId } } : {}),
    isDeleted: { $ne: true },
    status: { $ne: 'Deleted' },
    $and: [
      {
        $or: [
          { brand: project.brand },
          { client: project.client }
        ]
      },
      {
        $or: [
          { name: { $regex: monthRegex } },
          {
            $and: [
              { 'recurringConfig.currentCycle': { $regex: new RegExp(escapeRegex(monthWord), 'i') } },
              {
                $or: [
                  { 'recurringConfig.parentProjectId': String(projectId) },
                  { name: { $regex: titleRegex } }
                ]
              }
            ]
          }
        ]
      },
      {
        $or: [
          { 'recurringConfig.parentProjectId': String(projectId) },
          { name: { $regex: titleRegex } },
          ...(project.templateId ? [{ templateId: project.templateId }] : [])
        ]
      }
    ]
  };

  const existing = await Project.findOne(query);
  return existing;
}

/**
 * Core Engine: Generates a new month's project sprint with cloned tasks from template or parent.
 */
export async function generateProjectCycle({
  project,
  targetMonthYear = null,
  actor = null,
  device = 'System Scheduler'
}) {
  if (!project) throw new Error('Project is required to generate cycle.');

  const cfg = project.recurringConfig || {};
  const monthlyDay = Number(cfg.monthlyDay) || 1;

  // Determine target month/year
  let cycleMonthYear = targetMonthYear;
  if (!cycleMonthYear) {
    const nextDate = cfg.nextCycleDate ? new Date(cfg.nextCycleDate) : new Date();
    cycleMonthYear = nextDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  // 1. Check if an active (non-deleted) project already exists for this target month
  const activeExisting = await doesActiveCycleExist(project, cycleMonthYear);
  if (activeExisting) {
    throw new Error(
      `An active sprint cycle for "${cycleMonthYear}" already exists (${activeExisting.code} - ${activeExisting.name}).`
    );
  }

  // 2. Parse target month date & calculate following cutoff date
  // e.g. target is "November 2026", monthlyDay is 1 -> target date is 2026-11-01
  const targetDateObj = new Date(Date.parse(`${cycleMonthYear} 1`));
  const validTargetDate = isNaN(targetDateObj.getTime()) ? new Date() : targetDateObj;
  validTargetDate.setDate(Math.min(monthlyDay, 28));
  validTargetDate.setHours(12, 0, 0, 0);

  // Following month date (e.g. December 1, 2026)
  const followingMonthDate = new Date(validTargetDate.getFullYear(), validTargetDate.getMonth() + 1, Math.min(monthlyDay, 28), 12, 0, 0);
  const followingCycleDateIso = formatDateIso(followingMonthDate);

  const defaultStart = formatDateIso(validTargetDate);
  const defaultDue = formatDateIso(new Date(validTargetDate.getFullYear(), validTargetDate.getMonth() + 1, 0, 12, 0, 0));

  // 3. Generate Project Code & Name
  const codePrefix = (project.brand || 'PRJ').toUpperCase().slice(0, 4);
  const count = await Project.countDocuments();
  const newCode = `${codePrefix}-${100 + count + 1}`;
  const newName = formatProjectCycleName(project.name, cycleMonthYear);

  // 4. Look up template (if any) or fallback to parent project's existing tasks
  const templateId = project.templateId || cfg.templateId;
  const templateName = project.templateName || cfg.templateName;
  let blueprintTemplate = null;

  if (templateId || templateName) {
    blueprintTemplate = await Template.findOne({
      $or: [
        ...(templateId ? [{ _id: templateId }, { id: templateId }] : []),
        ...(templateName ? [{ name: templateName }] : [])
      ]
    });
  }

  const assignedTeam = cfg.assignedMemberIds || project.teamIds || project.team || [];
  const deliverablesCount = blueprintTemplate?.tasksTree && blueprintTemplate.tasksTree.length > 0
    ? countTreeNodes(blueprintTemplate.tasksTree)
    : (project.tasksCount || 0);

  // 5. Build New Project Payload
  const newProjectPayload = {
    code: newCode,
    name: newName,
    client: project.client || 'PMV',
    brand: project.brand || 'PMV',
    color: project.color || '#2563EB',
    type: 'recurring',
    category: blueprintTemplate?.category || project.category || 'General',
    ownerId: project.ownerId || project.owner,
    managerId: project.managerId || project.manager || project.ownerId,
    teamIds: assignedTeam,
    progress: 0,
    status: 'In Progress',
    priority: project.priority || 'High',
    startDate: defaultStart,
    endDate: defaultDue,
    targetDate: defaultDue,
    description: blueprintTemplate?.description || project.description || `Automated recurring sprint cycle for ${cycleMonthYear}`,
    tasksCount: deliverablesCount,
    completedTasksCount: 0,
    templateId: blueprintTemplate?._id ? String(blueprintTemplate._id) : (templateId || null),
    templateName: blueprintTemplate?.name || templateName || null,
    isDeleted: false,
    recurringConfig: {
      ...cfg,
      frequency: cfg.frequency || 'Monthly',
      monthlyDay: monthlyDay,
      currentCycle: cycleMonthYear,
      nextCycleDate: followingCycleDateIso,
      autoRenew: cfg.autoRenew !== false,
      parentProjectId: String(project._id || project.id),
      templateId: blueprintTemplate?._id ? String(blueprintTemplate._id) : (templateId || null),
      templateName: blueprintTemplate?.name || templateName || null,
      assignedMemberIds: assignedTeam
    }
  };

  const createdProject = await Project.create(newProjectPayload);

  // 6. Generate & Clone Tasks
  let generatedTasks = [];

  if (blueprintTemplate?.tasksTree && blueprintTemplate.tasksTree.length > 0) {
    // Generate from template tree
    const rawTasks = flattenTreeToTasks(
      blueprintTemplate.tasksTree,
      String(createdProject._id),
      createdProject.code,
      defaultStart,
      defaultDue
    );

    const tasksToInsert = rawTasks.map((t, idx) => ({
      code: t.code,
      title: t.title,
      projectId: String(createdProject._id),
      parentId: t.parentId,
      parentCode: t.parentCode,
      level: t.level || 0,
      assignedTo: assignedTeam.length > 0 ? assignedTeam[idx % assignedTeam.length] : null,
      status: 'Not Started',
      priority: t.priority || 'Medium',
      startDate: defaultStart,
      dueDate: defaultDue,
      targetDate: defaultDue,
      description: t.description || `Task generated for ${cycleMonthYear}`
    }));

    generatedTasks = await Task.insertMany(tasksToInsert);
  } else {
    // Fallback: Clone parent project's tasks preserving hierarchy!
    const parentTasks = await Task.find({
      $or: [
        { projectId: String(project._id) },
        { projectId: project.id },
        { projectId: project.code }
      ]
    }).sort({ level: 1, createdAt: 1 });

    if (parentTasks.length > 0) {
      const idMap = new Map(); // oldId -> new ObjectId
      const codeMap = new Map(); // oldCode -> newCode

      // 1st pass: create new IDs & codes
      parentTasks.forEach((oldTask, idx) => {
        const newTaskId = new mongoose.Types.ObjectId();
        idMap.set(String(oldTask._id), newTaskId);
        if (oldTask.id) idMap.set(String(oldTask.id), newTaskId);

        // Map code: replace parent project code with new project code
        const oldPrefix = project.code;
        const newCodeString = oldTask.code && oldTask.code.startsWith(oldPrefix)
          ? oldTask.code.replace(oldPrefix, createdProject.code)
          : `${createdProject.code}.${idx + 1}`;
        codeMap.set(oldTask.code, newCodeString);
      });

      // 2nd pass: build new tasks with remapped parentId & parentCode
      const clonedTasksToInsert = parentTasks.map((oldTask, idx) => {
        const newId = idMap.get(String(oldTask._id));
        const newParentId = oldTask.parentId ? (idMap.get(String(oldTask.parentId)) || null) : null;
        const newCodeVal = codeMap.get(oldTask.code) || `${createdProject.code}.${idx + 1}`;
        const newParentCodeVal = oldTask.parentCode ? (codeMap.get(oldTask.parentCode) || null) : null;

        return {
          _id: newId,
          code: newCodeVal,
          title: oldTask.title,
          projectId: String(createdProject._id),
          parentId: newParentId ? String(newParentId) : null,
          parentCode: newParentCodeVal,
          level: oldTask.level || 0,
          assignedTo: oldTask.assignedTo || (assignedTeam.length > 0 ? assignedTeam[idx % assignedTeam.length] : null),
          status: 'Not Started',
          priority: oldTask.priority || 'Medium',
          startDate: defaultStart,
          dueDate: defaultDue,
          targetDate: defaultDue,
          description: oldTask.description || `Task cloned for ${cycleMonthYear}`
        };
      });

      generatedTasks = await Task.insertMany(clonedTasksToInsert);
    }
  }

  // Update tasksCount on project
  if (generatedTasks.length > 0) {
    createdProject.tasksCount = generatedTasks.length;
    await createdProject.save();
  }

  // 7. Bump nextCycleDate on the parent project so it moves to next month
  const updatedParentConfig = {
    ...(project.recurringConfig || {}),
    nextCycleDate: followingCycleDateIso,
    lastRenewedCycle: cycleMonthYear,
    autoRenew: true
  };
  await Project.findByIdAndUpdate(project._id, {
    recurringConfig: updatedParentConfig
  });

  // 8. Audit Log & Realtime Event
  await AuditLog.create({
    action: 'RECURRING_SPRINT_CYCLE_GENERATED',
    details: `Generated "${cycleMonthYear}" recurring sprint cycle for "${createdProject.name}" (${createdProject.code}) with ${generatedTasks.length} deliverables`,
    module: 'PROJECTS',
    performedBy: actor?.name || 'System Scheduler',
    performedByEmail: actor?.email || '',
    performedByRole: actor?.role || 'Admin',
    target: createdProject.code,
    device,
    timestamp: new Date()
  });

  await RealtimeEvent.create({
    event: 'project_created',
    entityId: String(createdProject._id),
    payload: createdProject.toObject(),
    timestamp: new Date()
  });

  return {
    project: createdProject.toObject(),
    tasksCount: generatedTasks.length,
    cycleMonthYear
  };
}

/**
 * Scheduled Runner: Checks all recurring projects and auto-renews any overdue cycles
 * (Triggered automatically on API requests or server intervals).
 */
export async function runScheduledRecurringChecks({ actor = null, device = 'Background Engine' } = {}) {
  const now = new Date();
  const todayIso = formatDateIso(now);

  const recurringProjects = await Project.find({
    type: 'recurring',
    isDeleted: { $ne: true },
    status: { $ne: 'Deleted' },
    'recurringConfig.autoRenew': { $ne: false }
  });

  const generated = [];

  for (const proj of recurringProjects) {
    const cfg = proj.recurringConfig || {};
    const monthlyDay = Number(cfg.monthlyDay) || 1;

    // If nextCycleDate is missing, calculate it based on monthlyDay and today
    let nextDate = cfg.nextCycleDate;
    if (!nextDate) {
      const cutoffThisMonth = formatDateIso(new Date(now.getFullYear(), now.getMonth(), monthlyDay, 12, 0, 0));
      if (todayIso >= cutoffThisMonth) {
        nextDate = cutoffThisMonth;
      } else {
        nextDate = formatDateIso(new Date(now.getFullYear(), now.getMonth() - 1, monthlyDay, 12, 0, 0));
      }
    }

    if (nextDate <= todayIso) {
      const [ny, nm, nd] = String(nextDate).split('-').map(Number);
      const nextDateObj = new Date(ny, (nm || 1) - 1, nd || 1, 12, 0, 0);
      const targetMonthYear = !isNaN(nextDateObj.getTime())
        ? nextDateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      // Check if an active cycle already exists
      const existing = await doesActiveCycleExist(proj, targetMonthYear);

      if (!existing) {
        try {
          const res = await generateProjectCycle({
            project: proj,
            targetMonthYear,
            actor,
            device
          });
          generated.push(res);
        } catch (err) {
          console.error(`Failed to auto-renew cycle for project ${proj.code}:`, err);
        }
      } else {
        // Active cycle already exists, bump nextCycleDate to following month
        const followingIso = calculateNextCycleDate(nextDateObj, monthlyDay);
        const updatedParentConfig = {
          ...(proj.recurringConfig || {}),
          nextCycleDate: followingIso
        };
        await Project.findByIdAndUpdate(proj._id, {
          recurringConfig: updatedParentConfig
        });
      }
    }
  }

  return generated;
}
