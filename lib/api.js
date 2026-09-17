/**
 * Shoolin Innovations Ltd — Universal REST API Client
 * Connects to Express + MongoDB backend with automatic token handling,
 * error boundaries, and offline fallback capability.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pulsepm_jwt_token');
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `API error: ${response.status} ${response.statusText}`);
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
    getAll: () => request('/projects'),
    getById: (id) => request(`/projects/${id}`),
    create: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, updates) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  },

  // Tasks
  tasks: {
    getAll: (projectId = null) =>
      request(projectId ? `/tasks?projectId=${encodeURIComponent(projectId)}` : '/tasks'),
    create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) =>
      request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    update: (id, updates) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  },

  // Meetings
  meetings: {
    getAll: () => request('/meetings'),
    create: (data) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
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

  // Notifications
  notifications: {
    subscribe: (subscription, userId) =>
      request('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription, userId }),
      }),
  },

  // Auth
  auth: {
    login: (credentials) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    me: () => request('/auth/me'),
  },
};
