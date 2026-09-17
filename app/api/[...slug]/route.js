import { NextResponse } from 'next/server';
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

// Helper to normalize MongoDB _id to string id for React frontend
const transform = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.id || (obj._id ? obj._id.toString() : undefined);
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
    // 1. PROJECTS
    if (path === 'projects') {
      if (method === 'GET') {
        const projects = await Project.find().sort({ createdAt: -1 });
        return NextResponse.json(transformArr(projects));
      }
      if (method === 'POST') {
        const body = await request.json();
        const count = await Project.countDocuments();
        const payload = {
          code: body.code || `PRJ-${100 + count + 1}`,
          ...body,
        };
        const created = await Project.create(payload);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('projects/')) {
      const id = path.replace('projects/', '');
      if (method === 'GET') {
        const project = await Project.findOne({ $or: [{ _id: id }, { code: id }] });
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json(transform(project));
      }
      if (method === 'PUT') {
        const body = await request.json();
        const updated = await Project.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json(transform(updated));
      }
      if (method === 'DELETE') {
        const deleted = await Project.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        await Task.deleteMany({ projectId: id });
        return NextResponse.json({ success: true, id });
      }
    }

    // 2. TASKS
    if (path === 'tasks') {
      if (method === 'GET') {
        const projectId = url.searchParams.get('projectId');
        const filter = projectId ? { projectId } : {};
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
        const meetings = await Meeting.find().sort({ date: 1 });
        return NextResponse.json(transformArr(meetings));
      }
      if (method === 'POST') {
        const body = await request.json();
        const created = await Meeting.create(body);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    if (path.startsWith('meetings/')) {
      const id = path.replace('meetings/', '');
      if (method === 'DELETE') {
        const deleted = await Meeting.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
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

    if (path === 'rbac/audit-log') {
      if (method === 'GET') {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        return NextResponse.json(transformArr(logs));
      }
      if (method === 'POST') {
        const body = await request.json();
        const created = await AuditLog.create(body);
        return NextResponse.json(transform(created), { status: 201 });
      }
    }

    // 10. AUTH LOGIN & ME
    if (path === 'auth/login' && method === 'POST') {
      const { email } = await request.json();
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({
        token: 'jwt_shoolin_os_token_' + user._id,
        user: transform(user),
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
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export { handleRequest as GET, handleRequest as POST, handleRequest as PUT, handleRequest as PATCH, handleRequest as DELETE };
