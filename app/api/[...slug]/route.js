import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import { connectDB } from '@/lib/db';
import { Project } from '@/lib/models/Project';
import { Task } from '@/lib/models/Task';
import { Meeting } from '@/lib/models/Meeting';
import { Dependency } from '@/lib/models/Dependency';
import { Link } from '@/lib/models/Link';
import { User } from '@/lib/models/User';
import { Template } from '@/lib/models/Template';
import { MasterStatus } from '@/lib/models/MasterStatus';
import { Role } from '@/lib/models/Role';
import { RolePermission } from '@/lib/models/RolePermission';
import { UserOverride } from '@/lib/models/UserOverride';
import { AuditLog } from '@/lib/models/AuditLog';
import { Notification } from '@/lib/models/Notification';
import { Session } from '@/lib/models/Session';
import {
  sendLoginOtpEmail,
  sendPasswordResetEmail,
  sendNewUserWelcomeEmail,
} from '@/lib/email';

// Device parsing helper (No IP address used)
const parseDeviceInfo = (userAgent = '') => {
  let os = 'Windows';
  if (/Macintosh|Mac OS/i.test(userAgent)) os = 'macOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';

  let browser = 'Chrome';
  if (/Edg/i.test(userAgent)) browser = 'Edge';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
  else if (/Chrome/i.test(userAgent)) browser = 'Chrome';

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';

  return {
    os,
    browser,
    device: `${browser} on ${os} (${deviceType})`,
  };
};

const OTP_MINUTES = Math.min(Math.max(Number.parseInt(process.env.OTP_EXPIRES_MINS || '10', 10) || 10, 5), 30);
const OTP_REQUEST_COOLDOWN_MS = 60 * 1000;
const otpRequestTimestamps = new Map();

const normalizeId = (value) => String(value || '').trim();
const sameIdentity = (first, second) => normalizeId(first) === normalizeId(second);
const isObjectId = (value) => /^[a-f\d]{24}$/i.test(normalizeId(value));

const getAuthenticatedUser = async (request) => {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) {
    const error = new Error('Please sign in before changing a meeting.');
    error.status = 401;
    throw error;
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET || 'shoolin_os_jwt_secret_key_2026');
  } catch {
    const error = new Error('Your sign-in session is invalid or has expired.');
    error.status = 401;
    throw error;
  }

  const user = isObjectId(claims.id) ? await User.findById(claims.id) : null;
  if (!user || user.status === 'Inactive' || user.status === 'Disabled') {
    const error = new Error('Your account is no longer active.');
    error.status = 403;
    throw error;
  }

  return user;
};

const findUserByIdentifier = async (identifier) => {
  const value = normalizeId(identifier);
  if (!value) return null;
  const conditions = [{ email: { $regex: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }];
  if (isObjectId(value)) conditions.unshift({ _id: value });
  return User.findOne({ $or: conditions });
};

const isMeetingActor = (meeting, user, field) => {
  const userId = normalizeId(user?._id);
  const userEmail = normalizeId(user?.email).toLowerCase();
  const stored = normalizeId(meeting?.[field]);
  return Boolean(stored) && (sameIdentity(stored, userId) || stored.toLowerCase() === userEmail);
};

const getMeetingEndAt = ({ date, time = '10:00', duration = '45 mins' }) => {
  if (!date) return null;
  const match = String(time).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i);
  if (!match) return null;
  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const amPm = match[3]?.toLowerCase();
  if (hours > 23 || minutes > 59) return null;
  if (amPm) {
    if (hours > 12 || hours === 0) return null;
    if (amPm === 'pm' && hours < 12) hours += 12;
    if (amPm === 'am' && hours === 12) hours = 0;
  }
  const start = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  if (Number.isNaN(start.getTime())) return null;
  const durationMinutes = Number.parseInt(duration, 10);
  return new Date(start.getTime() + (Number.isFinite(durationMinutes) ? durationMinutes : 45) * 60 * 1000);
};

const archiveFinishedMeetings = async () => {
  const candidates = await Meeting.find({
    status: { $in: ['Approved', 'Accepted', 'Completed'] },
    isArchived: { $ne: true },
  });
  const concludedIds = candidates
    .filter((meeting) => {
      const end = getMeetingEndAt(meeting);
      return end && end.getTime() <= Date.now();
    })
    .map((meeting) => meeting._id);

  if (concludedIds.length) {
    await Meeting.updateMany(
      { _id: { $in: concludedIds } },
      { $set: { isArchived: true, archivedAt: new Date() } }
    );
  }
};

const assertFutureMeetingTime = (meeting) => {
  const end = getMeetingEndAt(meeting);
  if (!end || end.getTime() <= Date.now()) {
    const error = new Error('Choose a meeting date and end time in the future.');
    error.status = 400;
    throw error;
  }
};

// Helper to normalize MongoDB _id to string id for React frontend
const transform = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.id || (obj._id ? obj._id.toString() : undefined);
  delete obj.passwordHash;
  delete obj.otpCodeHash;
  delete obj.otpPurpose;
  delete obj.otpExpiresAt;
  return obj;
};

const transformArr = (docs) => docs.map((doc) => transform(doc));

async function handleRequest(request, context) {
  await connectDB();
  const { slug = [] } = (await context.params) || {};
  const path = slug.join('/');
  const method = request.method.toUpperCase();
  const url = new URL(request.url);

  try {
    // Immediate Session Termination Enforcement
    // If incoming request specifies x-session-id, verify that session has not been terminated
    const incomingSessionId = request.headers.get('x-session-id');
    const isPublicOrAuth = path.startsWith('auth/') || path === 'sessions/check' || path === 'health';
    if (incomingSessionId && !isPublicOrAuth) {
      const liveSession = await Session.findOne({ sessionId: incomingSessionId });
      if (liveSession && (liveSession.status === 'Terminated' || liveSession.status === 'Expired' || new Date() > new Date(liveSession.expiresAt))) {
        return NextResponse.json(
          { active: false, status: liveSession.status, message: 'Your session has been terminated by an administrator.' },
          { status: 401 }
        );
      }
    }

    // 1. PROJECTS
    if (path === 'projects') {
      if (method === 'GET') {
        const includeDeleted = url.searchParams.get('includeDeleted') === 'true' || url.searchParams.get('all') === 'true';
        const query = includeDeleted ? {} : { isDeleted: { $ne: true }, status: { $ne: 'Deleted' } };
        const projects = await Project.find(query).sort({ createdAt: -1 });
        return NextResponse.json(transformArr(projects));
      }
      if (method === 'POST') {
        const body = await request.json();
        const count = await Project.countDocuments();
        const payload = {
          code: body.code || `PRJ-${100 + count + 1}`,
          ...body,
          isDeleted: false,
        };
        const created = await Project.create(payload);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('projects/') && path.endsWith('/restore')) {
      const id = path.replace('projects/', '').replace('/restore', '');
      if (method === 'POST' || method === 'PATCH') {
        const project = await Project.findOne({ $or: [{ _id: id }, { code: id }] });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        project.isDeleted = false;
        project.status = 'In Progress';
        project.deletedAt = null;
        await project.save();
        return NextResponse.json(transform(project));
      }
    }

    if (path.startsWith('projects/') && !path.slice(9).includes('/')) {
      const id = path.replace('projects/', '');
      if (method === 'GET') {
        const project = await Project.findOne({ $or: [{ _id: id }, { code: id }] });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json(transform(project));
      }
      if (method === 'PUT') {
        const body = await request.json();
        const updated = await Project.findOneAndUpdate({ $or: [{ _id: id }, { code: id }] }, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
      if (method === 'DELETE') {
        const permanent = url.searchParams.get('permanent') === 'true';
        const project = await Project.findOne({ $or: [{ _id: id }, { code: id }] });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        if (permanent) {
          await Project.findByIdAndDelete(project._id);
          await Task.deleteMany({
            $or: [{ projectId: String(project._id) }, { projectId: project.code }, { projectId: id }],
          });
          return NextResponse.json({ success: true, id, permanent: true });
        } else {
          project.isDeleted = true;
          project.status = 'Deleted';
          project.deletedAt = new Date();
          await project.save();
          return NextResponse.json(transform(project));
        }
      }
    }

    // 2. TASKS
    if (path === 'tasks') {
      if (method === 'GET') {
        const projectId = url.searchParams.get('projectId');
        const includeDeletedProjects = url.searchParams.get('includeDeletedProjects') === 'true';

        let filter = {};
        if (projectId) {
          filter.projectId = projectId;
        } else if (!includeDeletedProjects) {
          // Exclude tasks belonging to soft-deleted projects
          const activeProjects = await Project.find(
            { isDeleted: { $ne: true }, status: { $ne: 'Deleted' } },
            { _id: 1, code: 1 }
          );
          const activeIds = activeProjects.map((p) => p._id.toString());
          const activeCodes = activeProjects.map((p) => p.code).filter(Boolean);
          filter.projectId = { $in: [...activeIds, ...activeCodes] };
        }

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        return NextResponse.json(transformArr(tasks));
      }
      if (method === 'POST') {
        const body = await request.json();
        const count = await Task.countDocuments();
        const payload = {
          code: body.code || `TSK-${100 + count + 1}`,
          ...body,
        };
        const created = await Task.create(payload);
        if (created.projectId) {
          await Project.findByIdAndUpdate(created.projectId, { $inc: { tasksCount: 1 } });
        }
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('tasks/') && path.endsWith('/status')) {
      const id = path.replace('tasks/', '').replace('/status', '');
      if (method === 'PATCH') {
        const { status } = await request.json();
        const updated = await Task.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
    }

    if (path.startsWith('tasks/') && !path.endsWith('/status')) {
      const id = path.replace('tasks/', '');
      if (method === 'PUT') {
        const body = await request.json();
        const updated = await Task.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
      if (method === 'DELETE') {
        const deleted = await Task.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        return NextResponse.json({ success: true, id });
      }
    }

    // 3. MEETINGS
    if (path === 'meetings') {
      if (method === 'GET') {
        await archiveFinishedMeetings();
        const meetings = await Meeting.find().sort({ date: 1, time: 1 });
        return NextResponse.json(transformArr(meetings));
      }
      if (method === 'POST') {
        const actor = await getAuthenticatedUser(request);
        const body = await request.json();
        const title = String(body.title || '').trim();
        if (!title) {
          return NextResponse.json({ error: 'Meeting title is required.' }, { status: 400 });
        }

        assertFutureMeetingTime(body);
        const approver = await findUserByIdentifier(body.approverId);
        if (!approver || approver.status === 'Inactive' || approver.status === 'Disabled') {
          return NextResponse.json({ error: 'Select an active designated approver.' }, { status: 400 });
        }
        if (sameIdentity(actor._id, approver._id)) {
          return NextResponse.json({ error: 'The meeting creator cannot approve their own meeting.' }, { status: 400 });
        }

        const allParticipants = [...new Set([...(body.participants || body.participantIds || []), String(actor._id)])]
          .map(normalizeId)
          .filter(Boolean);
        const optionalMembers = [...new Set(body.optionalMembers || body.optionalMemberIds || [])]
          .map(normalizeId)
          .filter(Boolean);
        const payload = {
          title,
          requestedBy: String(actor._id),
          requestedByName: actor.name,
          requestedByEmail: actor.email,
          approverId: String(approver._id),
          approverName: approver.name,
          participants: allParticipants,
          participantIds: allParticipants,
          optionalMembers,
          optionalMemberIds: optionalMembers,
          meetUrl: String(body.meetUrl || '').trim(),
          date: body.date,
          time: body.time || '10:00',
          duration: body.duration || '45 mins',
          priority: body.priority || 'Medium',
          projectId: body.projectId || '',
          relatedTaskId: body.relatedTaskId || '',
          description: String(body.description || '').trim(),
          status: 'Pending Approval',
          isArchived: false,
        };
        const created = await Meeting.create(payload);
        await Notification.create({
          userId: String(approver._id),
          type: 'meeting_requested',
          title: 'Meeting approval requested',
          detail: `${actor.name} requested approval for “${title}”.`,
          link: '/meetings?tab=pending',
        });
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('meetings/') && path.endsWith('/approve')) {
      const id = path.replace('meetings/', '').replace('/approve', '');
      const actor = await getAuthenticatedUser(request);
      const body = await request.json().catch(() => ({}));
      const meeting = await Meeting.findById(id);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      if (!isMeetingActor(meeting, actor, 'approverId')) {
        return NextResponse.json({ error: 'Only the designated approver can approve this meeting.' }, { status: 403 });
      }
      if (!['Pending Approval', 'Requested', 'Rescheduled'].includes(meeting.status)) {
        return NextResponse.json({ error: 'Only a pending meeting can be approved.' }, { status: 409 });
      }
      const updateDoc = { status: 'Approved', approvedAt: new Date(), isArchived: false, archivedAt: null };
      if (body.comments) {
        updateDoc.$push = {
          comments: {
            authorName: actor.name,
            authorId: String(actor._id),
            text: body.comments,
            createdAt: new Date(),
          },
        };
      }
      const updated = await Meeting.findByIdAndUpdate(id, updateDoc, { new: true });
      const notifiedIds = [...new Set([updated.requestedBy, ...(updated.participantIds || [])])]
        .map(normalizeId)
        .filter((userId) => userId && userId !== String(actor._id));
      if (notifiedIds.length) {
        await Notification.insertMany(
          notifiedIds.map((userId) => ({
            userId,
            type: 'meeting_approved',
            title: 'Meeting approved',
            detail: `“${updated.title}” is approved and ready to join.`,
            link: '/meetings',
          }))
        );
      }
      return NextResponse.json(transform(updated));
    }

    if (path.startsWith('meetings/') && path.endsWith('/decline')) {
      const id = path.replace('meetings/', '').replace('/decline', '');
      const actor = await getAuthenticatedUser(request);
      const body = await request.json().catch(() => ({}));
      const meeting = await Meeting.findById(id);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      if (!isMeetingActor(meeting, actor, 'approverId')) {
        return NextResponse.json({ error: 'Only the designated approver can reject this meeting.' }, { status: 403 });
      }
      if (!['Pending Approval', 'Requested', 'Rescheduled'].includes(meeting.status)) {
        return NextResponse.json({ error: 'Only a pending meeting can be rejected.' }, { status: 409 });
      }
      const updateDoc = { status: 'Declined' };
      if (body.comments) {
        updateDoc.$push = {
          comments: {
            authorName: actor.name,
            authorId: String(actor._id),
            text: body.comments,
            createdAt: new Date(),
          },
        };
      }
      const updated = await Meeting.findByIdAndUpdate(id, updateDoc, { new: true });
      await Notification.create({
        userId: normalizeId(meeting.requestedBy),
        type: 'meeting_rejected',
        title: 'Meeting not approved',
        detail: `“${meeting.title}” was rejected by ${actor.name}.`,
        link: '/meetings?tab=pending',
      });
      return NextResponse.json(transform(updated));
    }

    if (path.startsWith('meetings/') && path.endsWith('/reschedule')) {
      const id = path.replace('meetings/', '').replace('/reschedule', '');
      const actor = await getAuthenticatedUser(request);
      const { date, time, duration, comments } = await request.json();
      const meeting = await Meeting.findById(id);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      if (!isMeetingActor(meeting, actor, 'requestedBy')) {
        return NextResponse.json({ error: 'Only the meeting creator can reschedule this meeting.' }, { status: 403 });
      }
      assertFutureMeetingTime({
        date: date || meeting.date,
        time: time || meeting.time,
        duration: duration || meeting.duration,
      });
      const updateDoc = {
        ...(date ? { date } : {}),
        ...(time ? { time } : {}),
        ...(duration ? { duration } : {}),
        status: 'Pending Approval',
        isArchived: false,
        archivedAt: null,
        approvedAt: null,
        $inc: { rescheduleCount: 1 },
        $push: {
          comments: {
            authorName: actor.name,
            authorId: String(actor._id),
            text: `Rescheduled${comments ? `: ${comments}` : ''}`,
            createdAt: new Date(),
          },
        },
      };
      const updated = await Meeting.findByIdAndUpdate(id, updateDoc, { new: true });
      await Notification.create({
        userId: normalizeId(meeting.approverId),
        type: 'meeting_rescheduled',
        title: 'Meeting re-approval requested',
        detail: `${actor.name} rescheduled “${meeting.title}”.`,
        link: '/meetings?tab=pending',
      });
      return NextResponse.json(transform(updated));
    }

    if (path.startsWith('meetings/') && path.endsWith('/restore')) {
      const id = path.replace('meetings/', '').replace('/restore', '');
      const actor = await getAuthenticatedUser(request);
      const body = await request.json().catch(() => ({}));
      const meeting = await Meeting.findById(id);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      if (!isMeetingActor(meeting, actor, 'requestedBy')) {
        return NextResponse.json({ error: 'Only the meeting creator can restore this meeting.' }, { status: 403 });
      }
      const restoredSchedule = {
        date: body.date || meeting.date,
        time: body.time || meeting.time,
        duration: body.duration || meeting.duration,
      };
      assertFutureMeetingTime(restoredSchedule);
      const updateDoc = {
        isArchived: false,
        archivedAt: null,
        ...(body.date ? { date: body.date } : {}),
        ...(body.time ? { time: body.time } : {}),
        ...(body.duration ? { duration: body.duration } : {}),
        status: 'Pending Approval',
        approvedAt: null,
        $push: {
          comments: {
            authorName: actor.name,
            authorId: String(actor._id),
            text: 'Restored from archive and sent for approval.',
            createdAt: new Date(),
          },
        },
      };
      const updated = await Meeting.findByIdAndUpdate(id, updateDoc, { new: true });
      await Notification.create({
        userId: normalizeId(meeting.approverId),
        type: 'meeting_restored',
        title: 'Restored meeting requires approval',
        detail: `${actor.name} restored “${meeting.title}”.`,
        link: '/meetings?tab=pending',
      });
      return NextResponse.json(transform(updated));
    }

    if (path.startsWith('meetings/') && path.endsWith('/comments')) {
      const id = path.replace('meetings/', '').replace('/comments', '');
      const actor = await getAuthenticatedUser(request);
      const { text } = await request.json();
      const meeting = await Meeting.findById(id);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      const isCreator = isMeetingActor(meeting, actor, 'requestedBy');
      const isApprover = isMeetingActor(meeting, actor, 'approverId');
      const isApproved = ['Approved', 'Accepted', 'Completed'].includes(meeting.status);
      const isParticipant = isApproved && (meeting.participantIds || meeting.participants || []).some((memberId) =>
        sameIdentity(memberId, actor._id) || normalizeId(memberId).toLowerCase() === normalizeId(actor.email).toLowerCase()
      );
      if (!isCreator && !isApprover && !isParticipant) {
        return NextResponse.json({ error: 'You do not have access to this meeting discussion.' }, { status: 403 });
      }
      if (!String(text || '').trim()) {
        return NextResponse.json({ error: 'A comment cannot be empty.' }, { status: 400 });
      }
      const updated = await Meeting.findByIdAndUpdate(
        id,
        {
          $push: {
            comments: {
              authorName: actor.name,
              authorId: String(actor._id),
              text: String(text).trim(),
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );
      return NextResponse.json(transform(updated));
    }

    if (path.startsWith('meetings/') && !path.slice(9).includes('/')) {
      const id = path.replace('meetings/', '');
      if (method === 'GET') {
        await archiveFinishedMeetings();
        const meeting = await Meeting.findById(id);
        if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        return NextResponse.json(transform(meeting));
      }
      if (method === 'PUT') {
        const actor = await getAuthenticatedUser(request);
        const body = await request.json();
        const existing = await Meeting.findById(id);
        if (!existing) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        const isCreator = isMeetingActor(existing, actor, 'requestedBy');
        const isApprover = isMeetingActor(existing, actor, 'approverId');
        if (!isCreator && !isApprover) {
          return NextResponse.json({ error: 'Only the creator or designated approver can edit this meeting.' }, { status: 403 });
        }

        const updateData = {};
        const allowedFields = ['title', 'meetUrl', 'date', 'time', 'duration', 'priority', 'projectId', 'relatedTaskId', 'description'];
        for (const field of allowedFields) {
          if (Object.hasOwn(body, field)) updateData[field] = body[field];
        }
        if (Object.hasOwn(body, 'title') && !String(body.title || '').trim()) {
          return NextResponse.json({ error: 'Meeting title is required.' }, { status: 400 });
        }

        if (Object.hasOwn(body, 'approverId')) {
          const approver = await findUserByIdentifier(body.approverId);
          if (!approver || approver.status === 'Inactive' || approver.status === 'Disabled') {
            return NextResponse.json({ error: 'Select an active designated approver.' }, { status: 400 });
          }
          if (sameIdentity(existing.requestedBy, approver._id) || normalizeId(existing.requestedBy).toLowerCase() === normalizeId(approver.email).toLowerCase()) {
            return NextResponse.json({ error: 'The meeting creator cannot approve their own meeting.' }, { status: 400 });
          }
          updateData.approverId = String(approver._id);
          updateData.approverName = approver.name;
        }

        const participantValues = body.participants || body.participantIds;
        if (participantValues) {
          const participants = [...new Set([...participantValues, normalizeId(existing.requestedBy)])]
            .map(normalizeId)
            .filter(Boolean);
          updateData.participants = participants;
          updateData.participantIds = participants;
        }
        const optionalValues = body.optionalMembers || body.optionalMemberIds;
        if (optionalValues) {
          const optionalMembers = [...new Set(optionalValues)].map(normalizeId).filter(Boolean);
          updateData.optionalMembers = optionalMembers;
          updateData.optionalMemberIds = optionalMembers;
        }

        const hasScheduleChange = ['date', 'time', 'duration', 'approverId'].some((field) => Object.hasOwn(updateData, field) && normalizeId(updateData[field]) !== normalizeId(existing[field]));
        if (hasScheduleChange) {
          assertFutureMeetingTime({
            date: updateData.date || existing.date,
            time: updateData.time || existing.time,
            duration: updateData.duration || existing.duration,
          });
          updateData.status = 'Pending Approval';
          updateData.isArchived = false;
          updateData.archivedAt = null;
          updateData.approvedAt = null;
          updateData.$push = {
            comments: {
              authorName: actor.name,
              authorId: String(actor._id),
              text: 'Meeting details changed and require approval again.',
              createdAt: new Date(),
            },
          };
        }
        const updated = await Meeting.findByIdAndUpdate(id, updateData, { new: true });
        if (hasScheduleChange) {
          await Notification.create({
            userId: normalizeId(updated.approverId),
            type: 'meeting_updated',
            title: 'Meeting requires approval',
            detail: `${actor.name} updated “${updated.title}”.`,
            link: '/meetings?tab=pending',
          });
        }
        return NextResponse.json(transform(updated));
      }
      if (method === 'DELETE') {
        const actor = await getAuthenticatedUser(request);
        const meeting = await Meeting.findById(id);
        if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        if (!isMeetingActor(meeting, actor, 'requestedBy')) {
          return NextResponse.json({ error: 'Only the meeting creator can delete this meeting.' }, { status: 403 });
        }
        await Meeting.findByIdAndDelete(id);
        return NextResponse.json({ success: true, id });
      }
    }

    // 4. DEPENDENCIES
    if (path === 'dependencies') {
      if (method === 'GET') {
        const dependencies = await Dependency.find().sort({ createdAt: -1 });
        return NextResponse.json(transformArr(dependencies));
      }
      if (method === 'POST') {
        const body = await request.json();
        const created = await Dependency.create(body);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('dependencies/') && path.endsWith('/status')) {
      const id = path.replace('dependencies/', '').replace('/status', '');
      if (method === 'PATCH') {
        const { status } = await request.json();
        const updated = await Dependency.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return NextResponse.json({ error: 'Dependency not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
    }

    // 5. LINKS
    if (path === 'links') {
      if (method === 'GET') {
        const links = await Link.find().sort({ createdAt: -1 });
        return NextResponse.json(transformArr(links));
      }
      if (method === 'POST') {
        const body = await request.json();
        const created = await Link.create(body);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('links/')) {
      const id = path.replace('links/', '');
      if (method === 'PUT') {
        const body = await request.json();
        const updated = await Link.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
      if (method === 'DELETE') {
        const deleted = await Link.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        return NextResponse.json({ success: true, id });
      }
    }

    // 6. USERS
    if (path === 'users') {
      if (method === 'GET') {
        const users = await User.find({}, '-passwordHash').sort({ name: 1 });
        return NextResponse.json(transformArr(users));
      }
      if (method === 'POST') {
        const body = await request.json();
        const created = await User.create(body);
        try {
          if (created.email) {
            await sendNewUserWelcomeEmail({
              to: created.email,
              name: created.name || 'Team Member',
              role: created.role || 'Member',
              appUrl: process.env.CLIENT_URL || 'http://localhost:3001',
            });
          }
        } catch (mailErr) {
          console.error('Welcome email dispatch error:', mailErr.message);
        }
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('users/')) {
      const id = path.replace('users/', '');
      if (method === 'PUT') {
        const body = await request.json();
        const updated = await User.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
      if (method === 'DELETE') {
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json({ success: true, id });
      }
    }

    // 7. TEMPLATES
    if (path === 'templates') {
      if (method === 'GET') {
        const templates = await Template.find().sort({ name: 1 });
        return NextResponse.json(transformArr(templates));
      }
      if (method === 'POST') {
        const body = await request.json();
        const created = await Template.create(body);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    // 8. MASTER STATUSES & ROLES
    if (path === 'statuses' && method === 'GET') {
      const statuses = await MasterStatus.find().sort({ order: 1 });
      return NextResponse.json(transformArr(statuses));
    }

    if (path === 'roles' && method === 'GET') {
      const roles = await Role.find().sort({ name: 1 });
      return NextResponse.json(transformArr(roles));
    }

    // 8.5 NOTIFICATIONS
    if (path === 'notifications') {
      if (method === 'GET') {
        const userId = url.searchParams.get('userId');
        const filter = userId ? { userId } : {};
        const notifs = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
        return NextResponse.json(transformArr(notifs));
      }
    }

    if (path.startsWith('notifications/') && path.endsWith('/read')) {
      const id = path.replace('notifications/', '').replace('/read', '');
      if (method === 'PATCH') {
        const updated = await Notification.findByIdAndUpdate(id, { unread: false }, { new: true });
        return NextResponse.json(transform(updated));
      }
    }

    if (path === 'notifications/clear') {
      if (method === 'DELETE') {
        const userId = url.searchParams.get('userId');
        if (userId) await Notification.deleteMany({ userId });
        else await Notification.deleteMany({});
        return NextResponse.json({ success: true });
      }
    }

    if (path === 'notifications/subscribe') {
      if (method === 'POST') {
        return NextResponse.json({ success: true, message: 'Subscription active' });
      }
    }

    // 9. RBAC MATRIX & OVERRIDES
    if (path === 'rbac/matrix') {
      if (method === 'GET') {
        const roles = await RolePermission.find();
        const matrix = {};
        roles.forEach((r) => {
          matrix[r.roleName] = r.permissions;
        });
        return NextResponse.json(matrix);
      }
      if (method === 'PUT') {
        const { roleName, permissions } = await request.json();
        const updated = await RolePermission.findOneAndUpdate(
          { roleName },
          { permissions },
          { upsert: true, new: true }
        );
        return NextResponse.json({ roleName, permissions: updated.permissions });
      }
    }

    if (path === 'rbac/user-overrides') {
      if (method === 'GET') {
        const overrides = await UserOverride.find();
        const result = {};
        overrides.forEach((o) => {
          result[o.userId] = o.permissions;
        });
        return NextResponse.json(result);
      }
    }

    if (path.startsWith('rbac/user-overrides/')) {
      const userId = decodeURIComponent(path.replace('rbac/user-overrides/', ''));
      if (method === 'PUT') {
        const { permissions } = await request.json();
        const updated = await UserOverride.findOneAndUpdate(
          { userId },
          { permissions },
          { upsert: true, new: true }
        );
        return NextResponse.json({ userId, permissions: updated.permissions });
      }
      if (method === 'DELETE') {
        await UserOverride.findOneAndDelete({ userId });
        return NextResponse.json({ success: true, userId });
      }
    }

    if (path === 'rbac/audit-log' || path === 'audit-log') {
      if (method === 'GET') {
        const moduleParam = url.searchParams.get('module');
        const query = moduleParam && moduleParam !== 'ALL' ? { module: moduleParam } : {};
        const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(150);
        return NextResponse.json(transformArr(logs));
      }
      if (method === 'POST') {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent') || '';
        const { device } = parseDeviceInfo(userAgent);
        const created = await AuditLog.create({
          ...body,
          device: body.device || device,
        });
        return NextResponse.json(transform(created), { status: 201 });
      }
      if (method === 'DELETE') {
        const deleted = await AuditLog.deleteMany({});
        return NextResponse.json({ success: true, count: deleted.deletedCount, message: 'Audit logs cleared successfully' });
      }
    }

    // SESSIONS MANAGEMENT (30-day lifecycle, remote termination, no IP)
    if (path === 'sessions') {
      if (method === 'GET') {
        // Auto-expire outdated active sessions
        await Session.updateMany(
          { expiresAt: { $lt: new Date() }, status: 'Active' },
          { status: 'Expired' }
        );
        const sessions = await Session.find().sort({ loginAt: -1 }).limit(150);
        return NextResponse.json(transformArr(sessions));
      }
    }

    if ((path === 'sessions/clear-inactive' || path === 'sessions/clear') && (method === 'POST' || method === 'DELETE')) {
      const result = await Session.deleteMany({ status: { $in: ['Terminated', 'Expired'] } });
      await AuditLog.create({
        action: 'INACTIVE_SESSIONS_CLEARED',
        details: `Cleared ${result.deletedCount || 0} non-active (terminated/expired) member sessions`,
        module: 'SESSION',
        performedBy: 'Super Admin',
        performedByRole: 'Super Admin',
        timestamp: new Date(),
      });
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount || 0,
        message: `Successfully cleared ${result.deletedCount || 0} non-active sessions`,
      });
    }

    if (path === 'sessions/terminate-all-others' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const currentSessionId = body.currentSessionId || request.headers.get('x-session-id');
      await Session.updateMany(
        { sessionId: { $ne: currentSessionId }, status: 'Active' },
        { status: 'Terminated', terminatedAt: new Date(), terminatedBy: body.terminatedBy || 'Super Admin' }
      );

      await AuditLog.create({
        action: 'ALL_SESSIONS_TERMINATED',
        details: `Super Admin terminated all active member sessions`,
        module: 'SESSION',
        performedBy: body.terminatedBy || 'Super Admin',
        performedByRole: 'Super Admin',
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, message: 'All other active sessions have been terminated' });
    }

    if (path.startsWith('sessions/') && path.endsWith('/terminate')) {
      const sessionIdOrId = path.replace('sessions/', '').replace('/terminate', '');
      let session = await Session.findOne({
        $or: [
          { _id: sessionIdOrId.match(/^[0-9a-fA-F]{24}$/) ? sessionIdOrId : null },
          { sessionId: sessionIdOrId },
        ],
      });
      if (!session) {
        return NextResponse.json({ error: 'Session not found', message: 'Session not found' }, { status: 404 });
      }

      session.status = 'Terminated';
      session.terminatedAt = new Date();
      session.terminatedBy = 'Super Admin';
      await session.save();

      await AuditLog.create({
        action: 'SESSION_TERMINATED',
        details: `Session terminated for member ${session.userName} (${session.userEmail}) on ${session.device}`,
        module: 'SESSION',
        performedBy: 'Super Admin',
        performedByRole: 'Super Admin',
        target: session.userEmail,
        device: session.device,
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Session terminated successfully',
        session: transform(session),
      });
    }

    if (path.startsWith('sessions/') && method === 'DELETE') {
      const sessionIdOrId = path.replace('sessions/', '');
      let session = await Session.findOne({
        $or: [
          { _id: sessionIdOrId.match(/^[0-9a-fA-F]{24}$/) ? sessionIdOrId : null },
          { sessionId: sessionIdOrId },
        ],
      });
      if (session) {
        session.status = 'Terminated';
        session.terminatedAt = new Date();
        session.terminatedBy = 'Super Admin';
        await session.save();

        await AuditLog.create({
          action: 'SESSION_TERMINATED',
          details: `Session terminated for member ${session.userName} (${session.userEmail}) on ${session.device}`,
          module: 'SESSION',
          performedBy: 'Super Admin',
          performedByRole: 'Super Admin',
          target: session.userEmail,
          device: session.device,
          timestamp: new Date(),
        });
      }
      return NextResponse.json({ success: true, message: 'Session terminated successfully' });
    }

    if (path === 'sessions/check' && method === 'GET') {
      const sessionId = url.searchParams.get('sessionId') || request.headers.get('x-session-id');
      if (!sessionId) {
        return NextResponse.json({ active: true, status: 'Active' });
      }
      const session = await Session.findOne({ sessionId });
      if (!session || session.status === 'Terminated' || session.status === 'Expired' || new Date() > new Date(session.expiresAt)) {
        return NextResponse.json(
          { active: false, status: session?.status || 'NotFound', message: 'Your session was terminated or has expired.' },
          { status: 401 }
        );
      }
      // Update last active
      await Session.findByIdAndUpdate(session._id, { lastActiveAt: new Date() });
      return NextResponse.json({ active: true, status: 'Active', session: transform(session) });
    }

    // 10. AUTH LOGIN & ME
    if (path === 'auth/login' && method === 'POST') {
      const body = await request.json();
      const inputEmail = String(body.email || '').trim().toLowerCase();
      const inputPassword = String(body.password || '').trim();

      if (!inputEmail || !inputPassword) {
        return NextResponse.json(
          { error: 'Email and password are required', message: 'Email and password are required' },
          { status: 400 }
        );
      }

      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@shoolin.co.uk').trim().toLowerCase();
      const configuredAdminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

      let user = await User.findOne({ email: { $regex: new RegExp(`^${inputEmail}$`, 'i') } });

      const isAdminEmail = inputEmail === adminEmail;
      const matchesAdminPassword = Boolean(configuredAdminPassword) && isAdminEmail && inputPassword === configuredAdminPassword;

      if (!user) {
        if (isAdminEmail && matchesAdminPassword) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(inputPassword, salt);
          user = await User.create({
            name: 'Admin Shoolin',
            email: adminEmail,
            passwordHash: hash,
            role: 'Super Admin',
            department: 'Executive & Tech Lead',
            avatar: 'https://mrchamp-old.netlify.app/assets/link_share/logo.png',
            phone: '+1 (555) 234-5678',
            status: 'Active',
            lastActive: new Date().toISOString(),
          });
        } else {
          return NextResponse.json(
            { error: 'Account not found for this email address', message: 'Account not found for this email address' },
            { status: 404 }
          );
        }
      }

      if (user.status === 'Inactive' || user.status === 'Disabled') {
        return NextResponse.json({ error: 'This account is inactive. Contact an administrator.' }, { status: 403 });
      }

      // Verify password
      let isValidPassword = false;
      if (matchesAdminPassword) {
        isValidPassword = true;
        // Keep DB passwordHash in sync
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(inputPassword, salt);
        await User.findByIdAndUpdate(user._id, { passwordHash: hash });
      } else if (user.passwordHash) {
        isValidPassword = await bcrypt.compare(inputPassword, user.passwordHash);
      }

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials.', message: 'Invalid password. Please check your credentials.' },
          { status: 401 }
        );
      }

      // Generate 30-day session
      const userAgent = request.headers.get('user-agent') || '';
      const { os, browser, device } = parseDeviceInfo(userAgent);
      const sessionId = 'ses_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      const session = await Session.create({
        sessionId,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        avatar: user.avatar,
        device,
        browser,
        os,
        status: 'Active',
        loginAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt,
      });

      // Log to Audit Trail
      await AuditLog.create({
        action: 'USER_LOGIN',
        details: `Member ${user.name} (${user.email}) signed in via Password on ${device}`,
        module: 'AUTH',
        performedBy: user.name,
        performedByEmail: user.email,
        performedByRole: user.role,
        target: user.email,
        device,
        timestamp: new Date(),
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name, sessionId },
        process.env.JWT_SECRET || 'shoolin_os_jwt_secret_key_2026',
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        token,
        sessionId,
        user: transform(user),
        session: transform(session),
        message: 'Login successful',
      });
    }

    if (path === 'auth/send-otp' && method === 'POST') {
      const { email: rawEmail } = await request.json();
      const inputEmail = String(rawEmail || '').trim().toLowerCase();
      const user = await User.findOne({ email: { $regex: new RegExp(`^${inputEmail}$`, 'i') } });

      if (!user || user.status === 'Inactive' || user.status === 'Disabled') {
        return NextResponse.json({ error: 'No user account found for this email', message: 'No user account found for this email' }, { status: 404 });
      }

      const lastRequest = otpRequestTimestamps.get(`login:${inputEmail}`) || 0;
      if (Date.now() - lastRequest < OTP_REQUEST_COOLDOWN_MS) {
        return NextResponse.json({ error: 'Please wait one minute before requesting another code.' }, { status: 429 });
      }

      const generatedOtp = String(randomInt(100000, 1000000));

      try {
        await sendLoginOtpEmail({
          to: inputEmail,
          name: user.name,
          otp: generatedOtp,
          minutes: OTP_MINUTES,
        });
      } catch (mailErr) {
        console.error('Nodemailer OTP delivery error:', mailErr.message);
        return NextResponse.json(
          { error: 'Unable to send the email code right now. Please contact your administrator.' },
          { status: 503 }
        );
      }

      await User.findByIdAndUpdate(user._id, {
        otpCodeHash: await bcrypt.hash(generatedOtp, 10),
        otpPurpose: 'login',
        otpExpiresAt: new Date(Date.now() + OTP_MINUTES * 60 * 1000),
      });
      otpRequestTimestamps.set(`login:${inputEmail}`, Date.now());

      const userAgent = request.headers.get('user-agent') || '';
      const { device } = parseDeviceInfo(userAgent);

      await AuditLog.create({
        action: 'OTP_DISPATCHED',
        details: `One-time passcode dispatched to ${inputEmail} via Email (SMTP Sent)`,
        module: 'AUTH',
        performedBy: user.name,
        performedByEmail: inputEmail,
        performedByRole: user.role,
        target: inputEmail,
        device,
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: `Security code sent to ${inputEmail} via email.`,
      });
    }

    if (path === 'auth/verify-otp' && method === 'POST') {
      const { email: rawEmail, otp } = await request.json();
      const inputEmail = String(rawEmail || '').trim().toLowerCase();
      const inputOtp = String(otp || '').trim();

      const user = await User.findOne({ email: { $regex: new RegExp(`^${inputEmail}$`, 'i') } }).select('+otpCodeHash');

      if (!user || user.status === 'Inactive' || user.status === 'Disabled') {
        return NextResponse.json({ error: 'Account not found', message: 'Account not found' }, { status: 404 });
      }

      const isValidOtp = Boolean(
        /^\d{6}$/.test(inputOtp) &&
          user.otpPurpose === 'login' &&
          user.otpExpiresAt &&
          new Date(user.otpExpiresAt).getTime() > Date.now() &&
          user.otpCodeHash &&
          (await bcrypt.compare(inputOtp, user.otpCodeHash))
      );
      if (!isValidOtp) {
        return NextResponse.json({ error: 'Invalid or expired OTP code', message: 'Invalid or expired OTP code' }, { status: 400 });
      }

      await User.findByIdAndUpdate(user._id, {
        $unset: { otpCodeHash: 1 },
        $set: { otpPurpose: '', otpExpiresAt: null },
      });

      // Create 30-day session
      const userAgent = request.headers.get('user-agent') || '';
      const { os, browser, device } = parseDeviceInfo(userAgent);
      const sessionId = 'ses_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const session = await Session.create({
        sessionId,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        avatar: user.avatar,
        device,
        browser,
        os,
        status: 'Active',
        loginAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt,
      });

      await AuditLog.create({
        action: 'USER_LOGIN_OTP',
        details: `Member ${user.name} (${user.email}) signed in via Email OTP on ${device}`,
        module: 'AUTH',
        performedBy: user.name,
        performedByEmail: user.email,
        performedByRole: user.role,
        target: user.email,
        device,
        timestamp: new Date(),
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name, sessionId },
        process.env.JWT_SECRET || 'shoolin_os_jwt_secret_key_2026',
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        token,
        sessionId,
        user: transform(user),
        session: transform(session),
        message: 'OTP verified successfully',
      });
    }

    if (path === 'auth/forgot-password' && method === 'POST') {
      const { email: rawEmail } = await request.json();
      const inputEmail = String(rawEmail || '').trim().toLowerCase();

      if (!inputEmail) {
        return NextResponse.json({ error: 'Email address is required', message: 'Email address is required' }, { status: 400 });
      }

      const user = await User.findOne({ email: { $regex: new RegExp(`^${inputEmail}$`, 'i') } });

      if (!user || user.status === 'Inactive' || user.status === 'Disabled') {
        return NextResponse.json({ error: 'No account found for this email', message: 'No account found for this email' }, { status: 404 });
      }

      const lastRequest = otpRequestTimestamps.get(`password-reset:${inputEmail}`) || 0;
      if (Date.now() - lastRequest < OTP_REQUEST_COOLDOWN_MS) {
        return NextResponse.json({ error: 'Please wait one minute before requesting another code.' }, { status: 429 });
      }

      const generatedOtp = String(randomInt(100000, 1000000));

      try {
        await sendPasswordResetEmail({
          to: inputEmail,
          name: user.name,
          otp: generatedOtp,
          minutes: OTP_MINUTES,
        });
      } catch (mailErr) {
        console.error('Nodemailer Password Reset delivery error:', mailErr.message);
        return NextResponse.json(
          { error: 'Unable to send the password reset email right now. Please contact your administrator.' },
          { status: 503 }
        );
      }

      await User.findByIdAndUpdate(user._id, {
        otpCodeHash: await bcrypt.hash(generatedOtp, 10),
        otpPurpose: 'password-reset',
        otpExpiresAt: new Date(Date.now() + OTP_MINUTES * 60 * 1000),
      });
      otpRequestTimestamps.set(`password-reset:${inputEmail}`, Date.now());

      const userAgent = request.headers.get('user-agent') || '';
      const { device } = parseDeviceInfo(userAgent);

      await AuditLog.create({
        action: 'PASSWORD_RESET_REQUESTED',
        details: `Password recovery requested for ${inputEmail} via Email (SMTP Sent)`,
        module: 'SECURITY',
        performedBy: user.name,
        performedByEmail: inputEmail,
        performedByRole: user.role,
        target: inputEmail,
        device,
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: `Password reset instructions and 6-digit code sent to ${inputEmail}.`,
      });
    }

    if (path === 'auth/reset-password' && method === 'POST') {
      const { email: rawEmail, otp, newPassword } = await request.json();
      const inputEmail = String(rawEmail || '').trim().toLowerCase();
      const inputOtp = String(otp || '').trim();
      const cleanPassword = String(newPassword || '').trim();

      if (!inputEmail || !inputOtp || !cleanPassword) {
        return NextResponse.json({ error: 'Email, OTP code, and new password are required', message: 'Email, OTP code, and new password are required' }, { status: 400 });
      }

      if (cleanPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters', message: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const user = await User.findOne({ email: { $regex: new RegExp(`^${inputEmail}$`, 'i') } }).select('+otpCodeHash');

      if (!user) {
        return NextResponse.json({ error: 'Account not found', message: 'Account not found' }, { status: 404 });
      }

      const isValidOtp = Boolean(
        /^\d{6}$/.test(inputOtp) &&
          user.otpPurpose === 'password-reset' &&
          user.otpExpiresAt &&
          new Date(user.otpExpiresAt).getTime() > Date.now() &&
          user.otpCodeHash &&
          (await bcrypt.compare(inputOtp, user.otpCodeHash))
      );

      if (!isValidOtp) {
        return NextResponse.json({ error: 'Invalid or expired OTP verification code', message: 'Invalid or expired OTP verification code' }, { status: 400 });
      }

      // Hash new password and save to MongoDB
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(cleanPassword, salt);
      user.passwordHash = hash;
      user.otpCodeHash = undefined;
      user.otpPurpose = '';
      user.otpExpiresAt = null;
      await user.save();

      const userAgent = request.headers.get('user-agent') || '';
      const { device } = parseDeviceInfo(userAgent);

      await AuditLog.create({
        action: 'PASSWORD_RESET_COMPLETED',
        details: `Password set/reset successfully for ${user.name} (${user.email})`,
        module: 'SECURITY',
        performedBy: user.name,
        performedByEmail: user.email,
        performedByRole: user.role,
        target: user.email,
        device,
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully! You can now log in with your new password.',
      });
    }

    if (path === 'auth/me' && method === 'GET') {
      const user = await User.findOne();
      return NextResponse.json(user ? transform(user) : null);
    }

    if (path === 'health') {
      return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
    }

    return NextResponse.json({ error: `Route /api/${path} not found` }, { status: 404 });
  } catch (error) {
    console.error(`API Error [/api/${path}]:`, error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: Number.isInteger(error.status) ? error.status : 500 }
    );
  }
}

export { handleRequest as GET, handleRequest as POST, handleRequest as PUT, handleRequest as PATCH, handleRequest as DELETE };
