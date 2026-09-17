import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Meeting } from '../models/Meeting.js';
import { Dependency } from '../models/Dependency.js';
import { Link } from '../models/Link.js';
import { User } from '../models/User.js';
import { Template } from '../models/Template.js';
import { MasterStatus } from '../models/MasterStatus.js';
import { Role } from '../models/Role.js';
import { RolePermission } from '../models/RolePermission.js';
import { UserOverride } from '../models/UserOverride.js';
import { AuditLog } from '../models/AuditLog.js';
import { broadcastRealtimeEvent } from '../server.js';

const router = express.Router();

// Helper to normalize MongoDB _id to string id for React frontend
const transform = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj.id || obj._id.toString();
  return obj;
};

const transformArr = (docs) => docs.map((doc) => transform(doc));

// ----------------------------------------------------
// 1. PROJECTS
// ----------------------------------------------------
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(transformArr(projects));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({ $or: [{ _id: id }, { code: id }] });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(transform(project));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const payload = {
      code: req.body.code || `PRJ-${100 + count + 1}`,
      ...req.body,
    };
    const created = await Project.create(payload);
    const result = transform(created);
    broadcastRealtimeEvent('project_created', result);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Project.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    const result = transform(updated);
    broadcastRealtimeEvent('project_updated', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    await Task.deleteMany({ projectId: id });
    broadcastRealtimeEvent('project_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. TASKS
// ----------------------------------------------------
router.get('/tasks', async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(transformArr(tasks));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const count = await Task.countDocuments();
    const payload = {
      code: req.body.code || `TSK-${100 + count + 1}`,
      ...req.body,
    };
    const created = await Task.create(payload);
    const result = transform(created);

    // Increment tasks count on associated project if any
    if (created.projectId) {
      await Project.findByIdAndUpdate(created.projectId, { $inc: { tasksCount: 1 } });
    }

    broadcastRealtimeEvent('task_created', result);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Task.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    const result = transform(updated);
    broadcastRealtimeEvent('task_status_changed', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    const result = transform(updated);
    broadcastRealtimeEvent('task_updated', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    broadcastRealtimeEvent('task_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. MEETINGS
// ----------------------------------------------------
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ date: 1 });
    res.json(transformArr(meetings));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/meetings', async (req, res) => {
  try {
    const created = await Meeting.create(req.body);
    const result = transform(created);
    broadcastRealtimeEvent('meeting_created', result);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/meetings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Meeting.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Meeting not found' });
    broadcastRealtimeEvent('meeting_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. DEPENDENCIES
// ----------------------------------------------------
router.get('/dependencies', async (req, res) => {
  try {
    const dependencies = await Dependency.find().sort({ createdAt: -1 });
    res.json(transformArr(dependencies));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/dependencies', async (req, res) => {
  try {
    const created = await Dependency.create(req.body);
    const result = transform(created);
    broadcastRealtimeEvent('dependency_created', result);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/dependencies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Dependency.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Dependency not found' });
    const result = transform(updated);
    broadcastRealtimeEvent('dependency_updated', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. LINKS
// ----------------------------------------------------
router.get('/links', async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(transformArr(links));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/links', async (req, res) => {
  try {
    const created = await Link.create(req.body);
    const result = transform(created);
    broadcastRealtimeEvent('link_created', result);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Link.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Link not found' });
    const result = transform(updated);
    broadcastRealtimeEvent('link_updated', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Link.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Link not found' });
    broadcastRealtimeEvent('link_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. USERS
// ----------------------------------------------------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ name: 1 });
    res.json(transformArr(users));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const created = await User.create(req.body);
    const result = transform(created);
    delete result.passwordHash;
    broadcastRealtimeEvent('user_created', result);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const result = transform(updated);
    delete result.passwordHash;
    broadcastRealtimeEvent('user_updated', result);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    broadcastRealtimeEvent('user_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 7. TEMPLATES
// ----------------------------------------------------
router.get('/templates', async (req, res) => {
  try {
    const templates = await Template.find().sort({ name: 1 });
    res.json(transformArr(templates));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const created = await Template.create(req.body);
    res.status(201).json(transform(created));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 8. MASTER STATUSES
// ----------------------------------------------------
router.get('/statuses', async (req, res) => {
  try {
    const statuses = await MasterStatus.find().sort({ order: 1 });
    res.json(transformArr(statuses));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 9. SYSTEM ROLES
// ----------------------------------------------------
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json(transformArr(roles));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 10. AUTH
// ----------------------------------------------------
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Fallback for primary admin if user doesn't exist
      if (email === 'admin@shoolin.com' || email === 'uxdesigner@shoolin.co.uk') {
        return res.json({
          token: 'jwt_mock_token_admin_2026',
          user: {
            id: 'admin-1',
            name: 'Primary Admin',
            email,
            role: 'Super Admin',
            department: 'Executive Operations',
          },
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.passwordHash && password) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const userData = transform(user);
    delete userData.passwordHash;

    res.json({
      token: `jwt_token_${user._id}`,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 11. TIT-TO-BIT RBAC GOVERNANCE & ACCESS CONTROL
// ----------------------------------------------------
router.get('/rbac/matrix', async (req, res) => {
  try {
    const docs = await RolePermission.find();
    const result = {};
    docs.forEach((doc) => {
      result[doc.roleName] = doc.permissions || {};
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rbac/matrix', async (req, res) => {
  try {
    const { roleName, permissions } = req.body;
    if (!roleName) return res.status(400).json({ error: 'roleName required' });
    const updated = await RolePermission.findOneAndUpdate(
      { roleName },
      { roleName, permissions },
      { upsert: true, new: true }
    );
    broadcastRealtimeEvent('rbac_matrix_updated', { roleName, permissions });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/rbac/user-overrides', async (req, res) => {
  try {
    const docs = await UserOverride.find();
    const result = {};
    docs.forEach((doc) => {
      result[doc.userId] = doc.permissions || {};
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rbac/user-overrides/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    const updated = await UserOverride.findOneAndUpdate(
      { userId },
      { userId, permissions },
      { upsert: true, new: true }
    );
    broadcastRealtimeEvent('rbac_user_overrides_updated', { userId, permissions });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/rbac/user-overrides/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await UserOverride.deleteOne({ userId });
    broadcastRealtimeEvent('rbac_user_overrides_deleted', { userId });
    res.json({ success: true, userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rbac/audit-log', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(transformArr(logs));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rbac/audit-log', async (req, res) => {
  try {
    const created = await AuditLog.create(req.body);
    res.status(201).json(transform(created));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;

