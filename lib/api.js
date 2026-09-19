/**
 * Shoolin Innovations Ltd — Universal REST API Client
 * Connects to Express + MongoDB backend with automatic token handling,
 * error boundaries, and offline fallback capability.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pulsepm_jwt_token');
  } catch {
    return null;
  }
}

function getSessionId() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pulsepm_session_id');
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const sessionId = getSessionId();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(sessionId ? { 'x-session-id': sessionId } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));
      // If terminated or expired remotely, force instant local logout and redirect
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        (errData.active === false || errData.status === 'Terminated' || errData.status === 'Expired' || errData.message?.includes('terminated'))
      ) {
        localStorage.removeItem('pulsepm_is_authenticated');
        localStorage.removeItem('pulsepm_jwt_token');
        localStorage.removeItem('pulsepm_session_id');
        localStorage.removeItem('pulsepm_current_user');
        window.location.href = '/login?reason=terminated';
      }
      throw new Error(errData.message || errData.error || 'Unauthorized: Session terminated or expired');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Graceful offline warning
    console.warn(`[API Request Error]: ${endpoint}`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  health: () => request('/health'),

  // Projects
  projects: {
    getAll: (options = {}) =>
      request(options.includeDeleted ? '/projects?includeDeleted=true' : '/projects'),
    getById: (id) => request(`/projects/${id}`),
    create: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, updates) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    restore: (id) => request(`/projects/${id}/restore`, { method: 'POST' }),
    delete: (id, options = {}) =>
      request(`/projects/${id}${options.permanent ? '?permanent=true' : ''}`, { method: 'DELETE' }),
  },

  // Tasks
  tasks: {
    getAll: (projectId = null, options = {}) => {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (options.includeDeletedProjects) params.append('includeDeletedProjects', 'true');
      const q = params.toString();
      return request(q ? `/tasks?${q}` : '/tasks');
    },
    create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) =>
      request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    update: (id, updates) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  },

  // Meetings
  meetings: {
    getAll: () => request('/meetings'),
    getById: (id) => request(`/meetings/${id}`),
    create: (data) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    approve: (id, comments, authorName) =>
      request(`/meetings/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ comments, authorName }),
      }),
    decline: (id, comments, authorName) =>
      request(`/meetings/${id}/decline`, {
        method: 'PATCH',
        body: JSON.stringify({ comments, authorName }),
      }),
    reschedule: (id, date, time, comments, authorName, duration) =>
      request(`/meetings/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ date, time, comments, authorName, duration }),
      }),
    restore: (id, data = {}) =>
      request(`/meetings/${id}/restore`, { method: 'PATCH', body: JSON.stringify(data) }),
    addComment: (id, text, authorName, authorId) =>
      request(`/meetings/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text, authorName, authorId }),
      }),
    delete: (id) => request(`/meetings/${id}`, { method: 'DELETE' }),
  },

  // Dependencies
  dependencies: {
    getAll: () => request('/dependencies'),
    create: (data) => request('/dependencies', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) =>
      request(`/dependencies/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // Links
  links: {
    getAll: () => request('/links'),
    create: (data) => request('/links', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/links/${id}`, { method: 'DELETE' }),
  },

  // Users
  users: {
    getAll: () => request('/users'),
    create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, updates) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // Templates
  templates: {
    getAll: () => request('/templates'),
    create: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Master Statuses & Roles
  statuses: {
    getAll: () => request('/statuses'),
  },
  roles: {
    getAll: () => request('/roles'),
  },

  // Notifications
  notifications: {
    getAll: (userId) => request(`/notifications${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    clearAll: (userId) => request(`/notifications/clear?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' }),
    subscribe: (subscription, userId) =>
      request('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription, userId }),
      }),
  },

  // Tit-to-Bit RBAC Governance
  rbac: {
    getMatrix: () => request('/rbac/matrix'),
    updateRolePermissions: (roleName, permissions) =>
      request('/rbac/matrix', { method: 'PUT', body: JSON.stringify({ roleName, permissions }) }),
    getUserOverrides: () => request('/rbac/user-overrides'),
    setUserOverride: (userId, permissions) =>
      request(`/rbac/user-overrides/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }),
    deleteUserOverride: (userId) =>
      request(`/rbac/user-overrides/${encodeURIComponent(userId)}`, { method: 'DELETE' }),
    getAuditLog: () => request('/rbac/audit-log'),
    addAuditLog: (entry) =>
      request('/rbac/audit-log', { method: 'POST', body: JSON.stringify(entry) }),
  },

  // Sessions Management (30-day lifecycle, remote termination)
  sessions: {
    getAll: () => request('/sessions'),
    terminate: (id) => request(`/sessions/${id}/terminate`, { method: 'POST' }),
    terminateAllOthers: (currentSessionId) =>
      request('/sessions/terminate-all-others', {
        method: 'POST',
        body: JSON.stringify({ currentSessionId }),
      }),
    clearInactive: () => request('/sessions/clear-inactive', { method: 'POST' }),
    check: (sessionId) =>
      request(`/sessions/check${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`),
  },

  // Audit Logs
  auditLogs: {
    getAll: (module = null) =>
      request(`/rbac/audit-log${module ? `?module=${encodeURIComponent(module)}` : ''}`),
    create: (entry) =>
      request('/rbac/audit-log', { method: 'POST', body: JSON.stringify(entry) }),
    clearAll: () => request('/rbac/audit-log', { method: 'DELETE' }),
  },

  // Auth
  auth: {
    login: (credentials) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    me: () => request('/auth/me'),
    sendOtp: (email) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: ({ email, otp, newPassword }) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
    changePassword: (userId, currentPassword, newPassword) => request('/auth/change-password', { method: 'POST', body: JSON.stringify({ userId, currentPassword, newPassword }) }),
    invite: (userData) => request('/auth/invite', { method: 'POST', body: JSON.stringify(userData) }),
  },
};


