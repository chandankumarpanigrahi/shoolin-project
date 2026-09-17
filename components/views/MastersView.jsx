'use client';

import React, { useState, useMemo } from 'react';
import {
  Database,
  Users2,
  ShieldCheck,
  Tag,
  FolderGit2,
  Link2,
  Building2,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Search,
  CheckCircle2,
  Ban,
  Archive,
  ArrowRight,
  Filter,
  CheckSquare,
  Sparkles,
  Layers,
  UserCheck,
  Crown,
  Palette,
  PlayCircle,
  AlertOctagon,
  AlertTriangle,
  PauseCircle,
  CircleDot,
  Clock,
  Flame,
  ListTodo
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { showConfirm } from '@/lib/swal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { RoleBadge } from '@/components/common/Badges';
import { AccessControlView } from '@/components/views/AccessControlView';
import { useUrlTab } from '@/hooks/useUrlState';
import { INITIAL_PERMISSIONS } from '@/data/permissions';
import {
  BEHAVIOR_PRESETS,
  STATUS_COLOR_OPTIONS,
  STATUS_ICON_OPTIONS,
  DEFAULT_MASTER_STATUSES,
  isCompletedStatus as isStatusCompletedCheck
} from '@/data/statuses';

export const SCOPE_CATEGORIES = [
  {
    id: 'Task',
    name: 'Task Lifecycles',
    icon: CheckSquare,
    desc: 'Categorized states governing sprint activities and individual work items',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800'
  },
  {
    id: 'Project',
    name: 'Project Lifecycles',
    icon: FolderGit2,
    desc: 'Categorized states governing high-level project mandates and delivery milestones',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800'
  },
  {
    id: 'Global',
    name: 'Global Lifecycles',
    icon: Layers,
    desc: 'Categorized states available universally across both tasks and project mandates',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
  }
];

export const BRAND_COLOR_PRESETS = [
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Cyan', hex: '#0891B2' },
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Slate', hex: '#475569' },
];

export const getBrandColorStyle = (color) => {
  if (!color) return { backgroundColor: '#2563EB' };
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return { backgroundColor: color };
  }
  const legacyMap = {
    'bg-blue-600': '#2563EB',
    'bg-emerald-600': '#059669',
    'bg-amber-600': '#D97706',
    'bg-purple-600': '#9333EA',
    'bg-rose-600': '#E11D48',
    'bg-cyan-600': '#0891B2',
  };
  if (legacyMap[color]) {
    return { backgroundColor: legacyMap[color] };
  }
  return {};
};

export function MastersView() {
  const {
    users,
    currentUser,
    setCurrentUser,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserStatus,
    masterStatuses,
    saveMasterStatuses,
    blueprintCategories,
    handleAddBlueprintCategory,
    handleUpdateBlueprintCategory,
    handleDeleteBlueprintCategory,
    templates
  } = useAppContext();

  // Active Master Tab
  const [activeTab, setActiveTab] = useUrlTab('tab', 'users', [
    'users',
    'roles',
    'statuses',
    'brands',
    'categories',
    'template-categories',
    'blueprint-categories',
    'departments'
  ]);

  // =========================================================================
  // 1. USERS MASTER STATE
  // =========================================================================
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'User',
    department: 'Frontend Engineering',
    phone: '',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isDepartmentLead: false
  });

  // =========================================================================
  // 2. ROLES & PERMISSIONS MASTER STATE
  // =========================================================================
  const [rolesList, setRolesList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_roles_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return [
      { id: 'role-1', name: 'Super Admin', status: 'Active', isSystem: true, desc: 'Unrestricted master governance' },
      { id: 'role-2', name: 'Admin', status: 'Active', isSystem: true, desc: 'Operational departmental management' },
      { id: 'role-3', name: 'Manager / TL', status: 'Active', isSystem: true, desc: 'Team leadership & project mandate coordination' },
      { id: 'role-4', name: 'User', status: 'Active', isSystem: true, desc: 'Individual task contributor' },
    ];
  });

  const [permissionsMatrix, setPermissionsMatrix] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_perms_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return INITIAL_PERMISSIONS;
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', desc: '', status: 'Active' });

  // =========================================================================
  // 3. STATUSES & LIFECYCLES MASTER STATE
  // =========================================================================
  const [statusSearch, setStatusSearch] = useState('');
  const [statusScopeFilter, setStatusScopeFilter] = useState('ALL');
  const [statusesList, setStatusesList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_statuses_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((st) => ({
              ...st,
              behavior: st.behavior || (['completed', 'done', 'resolved', 'closed'].includes(st.name?.toLowerCase()) ? 'completed' : 'normal'),
              marksAsCompleted: st.marksAsCompleted !== undefined ? st.marksAsCompleted : ['completed', 'done', 'resolved', 'closed'].includes(st.name?.toLowerCase()),
              icon: st.icon || (['completed', 'done', 'resolved', 'closed'].includes(st.name?.toLowerCase()) ? 'CheckCircle2' : 'CircleDot'),
            }));
          }
        } catch (e) { }
      }
    }
    return DEFAULT_MASTER_STATUSES;
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusForm, setStatusForm] = useState({
    name: '',
    scope: 'Task',
    behavior: 'completed',
    marksAsCompleted: true,
    color: 'emerald',
    icon: 'CheckCircle2',
    status: 'Active',
    desc: ''
  });

  // Sync statusesList when masterStatuses from context updates
  React.useEffect(() => {
    if (masterStatuses && masterStatuses.length > 0) {
      setStatusesList(masterStatuses);
    }
  }, [masterStatuses]);

  // =========================================================================
  // 4. PROJECT BRANDS / FOLDERS MASTER STATE
  // =========================================================================
  const [brandSearch, setBrandSearch] = useState('');
  const [brandsList, setBrandsList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_brands_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return [
      { id: 'br-1', code: 'PMV', name: 'PMV Maritime', color: '#2563EB', status: 'Active', desc: 'Shipping fleet & logistics' },
      { id: 'br-2', code: 'FPD', name: 'FreshPod App', color: '#059669', status: 'Active', desc: 'Produce delivery mobile application' },
      { id: 'br-3', code: 'LGS', name: 'Lagos Logistics', color: '#D97706', status: 'Active', desc: 'Freight forwarding depot operations' },
      { id: 'br-4', code: 'INT', name: 'Internal Org', color: '#9333EA', status: 'Active', desc: 'Internal engineering & HR operations' },
    ];
  });

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState({ code: '', name: '', color: '#2563EB', status: 'Active', desc: '' });

  // =========================================================================
  // 5. LINK CATEGORIES MASTER STATE
  // =========================================================================
  const [catSearch, setCatSearch] = useState('');
  const [catsList, setCatsList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_cats_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return [
      { id: 'cat-1', name: 'Social Media', count: 11, status: 'Active', desc: 'Brand social handles & marketing' },
      { id: 'cat-2', name: 'Websites & Portals', count: 6, status: 'Active', desc: 'Production, staging, & QA environments' },
      { id: 'cat-3', name: 'Documents & Assets', count: 14, status: 'Active', desc: 'Google Drive, Sheets, Figma, & Canva' },
      { id: 'cat-4', name: 'Developer Tools & Cloud', count: 13, status: 'Active', desc: 'GitHub, AWS, Docker, & Vercel' },
    ];
  });

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', count: 0, status: 'Active', desc: '' });

  // =========================================================================
  // 5.5. BLUEPRINT / TEMPLATE CATEGORIES MASTER STATE
  // =========================================================================
  const [blueprintCatSearch, setBlueprintCatSearch] = useState('');
  const [blueprintCatStatusFilter, setBlueprintCatStatusFilter] = useState('ALL');
  const [isBlueprintCatModalOpen, setIsBlueprintCatModalOpen] = useState(false);
  const [editingBlueprintCat, setEditingBlueprintCat] = useState(null);
  const [blueprintCatForm, setBlueprintCatForm] = useState({
    name: '',
    code: '',
    color: '#2563EB',
    status: 'Active',
    description: ''
  });

  const filteredBlueprintCats = useMemo(() => {
    return (blueprintCategories || []).filter((c) => {
      if (blueprintCatStatusFilter !== 'ALL' && c.status !== blueprintCatStatusFilter) return false;
      if (blueprintCatSearch.trim()) {
        const q = blueprintCatSearch.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchCode = (c.code || '').toLowerCase().includes(q);
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDesc) return false;
      }
      return true;
    });
  }, [blueprintCategories, blueprintCatSearch, blueprintCatStatusFilter]);

  // =========================================================================
  // 6. DEPARTMENTS MASTER STATE
  // =========================================================================
  const [depSearch, setDepSearch] = useState('');
  const [depsList, setDepsList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsepm_master_deps_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
      }
    }
    return [
      { id: 'dep-1', code: 'EXEC', name: 'Executive & Tech Lead', lead: 'Alex Rivera', members: 2, status: 'Active' },
      { id: 'dep-2', code: 'OPS', name: 'Project Operations', lead: 'Sarah Chen', members: 4, status: 'Active' },
      { id: 'dep-3', code: 'ENG-BE', name: 'Backend Engineering', lead: 'Rahul Sharma', members: 6, status: 'Active' },
      { id: 'dep-4', code: 'ENG-FE', name: 'Frontend Engineering', lead: 'Marcus Vance', members: 5, status: 'Active' },
      { id: 'dep-5', code: 'DESIGN', name: 'UI/UX & Product Design', lead: 'Priya Patel', members: 3, status: 'Active' },
      { id: 'dep-6', code: 'QA-DEVOPS', name: 'QA & DevOps', lead: 'David Kim', members: 4, status: 'Active' },
    ];
  });

  const [isDepModalOpen, setIsDepModalOpen] = useState(false);
  const [editingDep, setEditingDep] = useState(null);
  const [depForm, setDepForm] = useState({ code: '', name: '', lead: '', members: 0, status: 'Active' });

  // Persistence helpers
  const saveRoles = (items) => {
    setRolesList(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_roles_v2', JSON.stringify(items));
  };

  const savePermissions = (matrix) => {
    setPermissionsMatrix(matrix);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_perms_v2', JSON.stringify(matrix));
  };

  const saveStatuses = (items) => {
    setStatusesList(items);
    if (saveMasterStatuses) saveMasterStatuses(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_statuses_v2', JSON.stringify(items));
  };

  const saveBrands = (items) => {
    setBrandsList(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_brands_v2', JSON.stringify(items));
  };

  const saveCats = (items) => {
    setCatsList(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_cats_v2', JSON.stringify(items));
  };

  const saveDeps = (items) => {
    setDepsList(items);
    if (typeof window !== 'undefined') localStorage.setItem('pulsepm_master_deps_v2', JSON.stringify(items));
  };

  // =========================================================================
  // FILTERED DATASETS
  // =========================================================================
  const filteredUsers = useMemo(() => {
    return (users || []).filter((u) => {
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== 'ALL' && (u.status || 'Active') !== userStatusFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }
      return true;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredStatuses = useMemo(() => {
    return statusesList.filter((s) => {
      if (statusScopeFilter !== 'ALL' && s.scope !== statusScopeFilter) return false;
      if (statusSearch.trim()) {
        const q = statusSearch.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [statusesList, statusSearch, statusScopeFilter]);

  const filteredBrands = useMemo(() => {
    return brandsList.filter((b) => {
      if (brandSearch.trim()) {
        const q = brandSearch.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [brandsList, brandSearch]);

  const filteredCats = useMemo(() => {
    return catsList.filter((c) => {
      if (catSearch.trim()) {
        const q = catSearch.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
      }
      return true;
    });
  }, [catsList, catSearch]);

  const filteredDeps = useMemo(() => {
    return depsList.filter((d) => {
      if (depSearch.trim()) {
        const q = depSearch.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.lead.toLowerCase().includes(q);
      }
      return true;
    });
  }, [depsList, depSearch]);

  // =========================================================================
  // ACTIONS: USERS
  // =========================================================================
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) return;

    const trimmedName = userForm.name.trim();

    if (editingUser) {
      const updated = {
        ...editingUser,
        name: trimmedName,
        email: userForm.email.trim(),
        role: userForm.role,
        department: userForm.department,
        phone: userForm.phone.trim(),
        status: userForm.status
      };
      if (handleUpdateUser) handleUpdateUser(updated);

      // Handle two-way Department <-> TL synchronization
      if (userForm.isDepartmentLead) {
        const nextDeps = depsList.map((d) => {
          if (d.name === userForm.department) {
            return { ...d, lead: trimmedName };
          }
          if (d.lead === editingUser.name && d.name !== userForm.department) {
            return { ...d, lead: 'Unassigned' };
          }
          return d;
        });
        saveDeps(nextDeps);
      } else if (depsList.some((d) => d.name === userForm.department && d.lead === editingUser.name)) {
        const nextDeps = depsList.map((d) => (d.name === userForm.department ? { ...d, lead: 'Unassigned' } : d));
        saveDeps(nextDeps);
      }
    } else {
      const newUser = {
        id: 'usr-' + Date.now(),
        name: trimmedName,
        email: userForm.email.trim(),
        role: userForm.role,
        department: userForm.department,
        phone: userForm.phone.trim() || '+1 (555) 000-0000',
        activeTasks: 0,
        projectsCount: 0,
        status: userForm.status,
        avatar: userForm.avatar,
        lastActive: 'Just now'
      };
      if (handleAddUser) handleAddUser(newUser);

      if (userForm.isDepartmentLead) {
        const nextDeps = depsList.map((d) => (d.name === userForm.department ? { ...d, lead: trimmedName } : d));
        saveDeps(nextDeps);
      }
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleUserArchive = (user) => {
    const nextStatus = user.status === 'Active' ? 'Deactivated' : user.status === 'Deactivated' ? 'Archived' : 'Active';
    if (handleToggleUserStatus) handleToggleUserStatus(user.id, nextStatus);
  };

  // =========================================================================
  // ACTIONS: ROLES & PERMISSIONS
  // =========================================================================
  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    if (editingRole) {
      const updated = rolesList.map((r) => (r.id === editingRole.id ? { ...r, name: roleForm.name.trim(), desc: roleForm.desc.trim(), status: roleForm.status } : r));
      saveRoles(updated);
    } else {
      const cleanName = roleForm.name.trim();
      const newRole = {
        id: 'role-' + Date.now(),
        name: cleanName,
        status: roleForm.status,
        isSystem: false,
        desc: roleForm.desc.trim() || 'Custom operational role'
      };
      saveRoles([...rolesList, newRole]);

      // Add to matrix
      const nextMatrix = permissionsMatrix.map((p) => ({
        ...p,
        roles: { ...p.roles, [cleanName]: 'Limited' }
      }));
      savePermissions(nextMatrix);
    }
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleToggleRoleArchive = (role) => {
    if (role.isSystem) {
      alert('System primary roles cannot be deactivated.');
      return;
    }
    const nextStatus = role.status === 'Active' ? 'Deactivated' : 'Active';
    saveRoles(rolesList.map((r) => (r.id === role.id ? { ...r, status: nextStatus } : r)));
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      alert('System primary roles cannot be deleted.');
      return;
    }
    const confirmed = await showConfirm({
      title: `Delete Custom Role "${role.name}"?`,
      confirmButtonText: 'Yes, Delete Role',
    });
    if (confirmed) {
      saveRoles(rolesList.filter((r) => r.id !== role.id));
    }
  };

  const handleTogglePermission = (permId, roleName) => {
    const nextMatrix = permissionsMatrix.map((p) => {
      if (p.id === permId) {
        const currentVal = p.roles[roleName] || 'None';
        const isChecked = currentVal === 'Full' || currentVal.includes('Full') || currentVal.includes('Limited');
        const nextVal = isChecked ? 'None' : 'Full';

        return {
          ...p,
          roles: { ...p.roles, [roleName]: nextVal }
        };
      }
      return p;
    });
    savePermissions(nextMatrix);
  };

  // =========================================================================
  // ACTIONS: STATUSES
  // =========================================================================
  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!statusForm.name.trim()) return;

    if (editingStatus) {
      const updated = statusesList.map((s) =>
        s.id === editingStatus.id
          ? {
            ...s,
            ...statusForm,
            name: statusForm.name.trim(),
            scope: statusForm.scope || 'Task',
            behavior: statusForm.behavior || 'normal',
            marksAsCompleted: Boolean(statusForm.marksAsCompleted),
            color: statusForm.color || 'emerald',
            icon: statusForm.icon || (statusForm.marksAsCompleted ? 'CheckCircle2' : 'CircleDot'),
            desc: statusForm.desc.trim() || 'Custom lifecycle stage'
          }
          : s
      );
      saveStatuses(updated);
    } else {
      const newStatus = {
        id: 'st-' + Date.now(),
        name: statusForm.name.trim(),
        scope: statusForm.scope || 'Task',
        behavior: statusForm.behavior || 'normal',
        marksAsCompleted: Boolean(statusForm.marksAsCompleted),
        color: statusForm.color || 'emerald',
        icon: statusForm.icon || (statusForm.marksAsCompleted ? 'CheckCircle2' : 'CircleDot'),
        status: statusForm.status || 'Active',
        desc: statusForm.desc.trim() || 'Custom lifecycle stage'
      };
      saveStatuses([...statusesList, newStatus]);
    }
    setIsStatusModalOpen(false);
    setEditingStatus(null);
  };

  const handleToggleStatusStrikethrough = (st) => {
    const nextVal = !Boolean(st.marksAsCompleted);
    const updated = statusesList.map((s) => {
      if (s.id === st.id) {
        return {
          ...s,
          marksAsCompleted: nextVal,
          behavior: nextVal ? 'completed' : (s.behavior === 'completed' ? 'normal' : s.behavior),
          icon: nextVal ? 'CheckCircle2' : (s.icon === 'CheckCircle2' ? 'CircleDot' : s.icon)
        };
      }
      return s;
    });
    saveStatuses(updated);
  };

  const handleToggleStatusArchive = (st) => {
    const nextStatus = st.status === 'Active' ? 'Deactivated' : st.status === 'Deactivated' ? 'Archived' : 'Active';
    saveStatuses(statusesList.map((s) => (s.id === st.id ? { ...s, status: nextStatus } : s)));
  };

  const handleDeleteStatus = async (st) => {
    const confirmed = await showConfirm({
      title: `Delete Status "${st.name}"?`,
      confirmButtonText: 'Yes, Delete Status',
    });
    if (confirmed) {
      saveStatuses(statusesList.filter((s) => s.id !== st.id));
    }
  };

  // =========================================================================
  // ACTIONS: BRANDS
  // =========================================================================
  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (!brandForm.name.trim() || !brandForm.code.trim()) return;

    if (editingBrand) {
      const updated = brandsList.map((b) => (b.id === editingBrand.id ? { ...b, ...brandForm, code: brandForm.code.toUpperCase().trim(), name: brandForm.name.trim() } : b));
      saveBrands(updated);
    } else {
      const newBrand = {
        id: 'br-' + Date.now(),
        code: brandForm.code.toUpperCase().trim(),
        name: brandForm.name.trim(),
        color: brandForm.color,
        status: brandForm.status,
        desc: brandForm.desc.trim() || 'Master client folder'
      };
      saveBrands([...brandsList, newBrand]);
    }
    setIsBrandModalOpen(false);
    setEditingBrand(null);
  };

  const handleToggleBrandArchive = (b) => {
    const nextStatus = b.status === 'Active' ? 'Deactivated' : b.status === 'Deactivated' ? 'Archived' : 'Active';
    saveBrands(brandsList.map((br) => (br.id === b.id ? { ...br, status: nextStatus } : br)));
  };

  const handleDeleteBrand = async (b) => {
    const confirmed = await showConfirm({
      title: `Delete Brand Folder "${b.name}"?`,
      confirmButtonText: 'Yes, Delete Brand',
    });
    if (confirmed) {
      saveBrands(brandsList.filter((br) => br.id !== b.id));
    }
  };

  // =========================================================================
  // ACTIONS: LINK CATEGORIES
  // =========================================================================
  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    if (editingCat) {
      const updated = catsList.map((c) => (c.id === editingCat.id ? { ...c, ...catForm, name: catForm.name.trim() } : c));
      saveCats(updated);
    } else {
      const newCat = {
        id: 'cat-' + Date.now(),
        name: catForm.name.trim(),
        count: 0,
        status: catForm.status,
        desc: catForm.desc.trim() || 'Master link category'
      };
      saveCats([...catsList, newCat]);
    }
    setIsCatModalOpen(false);
    setEditingCat(null);
  };

  const handleToggleCatArchive = (c) => {
    const nextStatus = c.status === 'Active' ? 'Deactivated' : c.status === 'Deactivated' ? 'Archived' : 'Active';
    saveCats(catsList.map((cat) => (cat.id === c.id ? { ...cat, status: nextStatus } : cat)));
  };

  const handleDeleteCat = async (c) => {
    const confirmed = await showConfirm({
      title: `Delete Link Category "${c.name}"?`,
      confirmButtonText: 'Yes, Delete Category',
    });
    if (confirmed) {
      saveCats(catsList.filter((cat) => cat.id !== c.id));
    }
  };

  // =========================================================================
  // ACTIONS: BLUEPRINT / TEMPLATE CATEGORIES
  // =========================================================================
  const handleBlueprintCatSubmit = (e) => {
    e.preventDefault();
    if (!blueprintCatForm.name.trim()) return;

    if (editingBlueprintCat) {
      const updated = {
        ...editingBlueprintCat,
        ...blueprintCatForm,
        name: blueprintCatForm.name.trim(),
        code: (blueprintCatForm.code.trim() || blueprintCatForm.name.trim().slice(0, 4)).toUpperCase(),
        description: blueprintCatForm.description.trim()
      };
      if (handleUpdateBlueprintCategory) handleUpdateBlueprintCategory(updated);
    } else {
      const newCat = {
        id: 'bcat-' + Date.now(),
        name: blueprintCatForm.name.trim(),
        code: (blueprintCatForm.code.trim() || blueprintCatForm.name.trim().slice(0, 4)).toUpperCase(),
        color: blueprintCatForm.color || '#2563EB',
        status: blueprintCatForm.status || 'Active',
        description: blueprintCatForm.description.trim() || 'Sprint architecture template category',
        isSystem: false
      };
      if (handleAddBlueprintCategory) handleAddBlueprintCategory(newCat);
    }
    setIsBlueprintCatModalOpen(false);
    setEditingBlueprintCat(null);
  };

  const handleToggleBlueprintCatArchive = (c) => {
    const nextStatus = c.status === 'Active' ? 'Archived' : 'Active';
    if (handleUpdateBlueprintCategory) {
      handleUpdateBlueprintCategory({ ...c, status: nextStatus });
    }
  };

  const handleDeleteBlueprintCat = async (c) => {
    const usageCount = (templates || []).filter((t) => t.category === c.name).length;
    const confirmMsg =
      usageCount > 0
        ? `Category "${c.name}" is associated with ${usageCount} template(s). Remove it?`
        : `Remove template category "${c.name}"?`;
    const confirmed = await showConfirm({
      title: `Remove Category "${c.name}"?`,
      text: confirmMsg,
      confirmButtonText: 'Yes, Remove Category',
    });
    if (confirmed) {
      if (handleDeleteBlueprintCategory) handleDeleteBlueprintCategory(c.id);
    }
  };

  // =========================================================================
  // ACTIONS: DEPARTMENTS
  // =========================================================================
  const handleDepSubmit = (e) => {
    e.preventDefault();
    if (!depForm.name.trim() || !depForm.code.trim()) return;

    const depName = depForm.name.trim();
    const depLead = depForm.lead ? depForm.lead.trim() : 'Unassigned';

    if (editingDep) {
      const updated = depsList.map((d) => (d.id === editingDep.id ? { ...d, ...depForm, code: depForm.code.toUpperCase().trim(), name: depName, lead: depLead } : d));
      saveDeps(updated);
    } else {
      const newDep = {
        id: 'dep-' + Date.now(),
        code: depForm.code.toUpperCase().trim(),
        name: depName,
        lead: depLead,
        members: 0,
        status: depForm.status
      };
      saveDeps([...depsList, newDep]);
    }

    // If a registered user is chosen as lead, sync their department to this one
    if (depLead && depLead !== 'Unassigned') {
      const targetUser = (users || []).find((u) => u.name === depLead);
      if (targetUser && targetUser.department !== depName && handleUpdateUser) {
        handleUpdateUser({ ...targetUser, department: depName });
      }
    }

    setIsDepModalOpen(false);
    setEditingDep(null);
  };

  const handleToggleDepArchive = (d) => {
    const nextStatus = d.status === 'Active' ? 'Deactivated' : d.status === 'Deactivated' ? 'Archived' : 'Active';
    saveDeps(depsList.map((dp) => (dp.id === d.id ? { ...dp, status: nextStatus } : dp)));
  };

  const handleDeleteDep = async (d) => {
    const confirmed = await showConfirm({
      title: `Delete Department "${d.name}"?`,
      confirmButtonText: 'Yes, Delete Department',
    });
    if (confirmed) {
      saveDeps(depsList.filter((dp) => dp.id !== d.id));
    }
  };

  // Helper render for Status badge
  const renderStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    if (status === 'Deactivated') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Deactivated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Archived
      </span>
    );
  };

  const renderStatusPill = (st) => {
    const colorKey = (st.color || '').toLowerCase();
    const nameLower = (st.name || '').toLowerCase();

    const colorStyles = {
      emerald: {
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      },
      green: {
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      },
      blue: {
        pill: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500'
      },
      violet: {
        pill: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500'
      },
      purple: {
        pill: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500'
      },
      amber: {
        pill: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500'
      },
      orange: {
        pill: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500'
      },
      rose: {
        pill: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500'
      },
      red: {
        pill: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500'
      },
      teal: {
        pill: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800',
        dot: 'bg-teal-500'
      },
      slate: {
        pill: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400'
      }
    };

    let styleObj = colorStyles[colorKey];
    if (!styleObj) {
      if (nameLower.includes('complete') || nameLower.includes('done') || nameLower.includes('resolve') || st.marksAsCompleted) {
        styleObj = colorStyles.emerald;
      } else if (nameLower.includes('progress') || nameLower.includes('active') || nameLower.includes('dev')) {
        styleObj = colorStyles.blue;
      } else if (nameLower.includes('review') || nameLower.includes('qa') || nameLower.includes('audit')) {
        styleObj = colorStyles.violet;
      } else if (nameLower.includes('block') || nameLower.includes('cancel') || nameLower.includes('delay')) {
        styleObj = colorStyles.rose;
      } else if (nameLower.includes('pause') || nameLower.includes('wait') || nameLower.includes('hold')) {
        styleObj = colorStyles.amber;
      } else {
        styleObj = colorStyles.slate;
      }
    }

    const isHex = st.color && st.color.startsWith('#');
    const customStyle = isHex ? {
      backgroundColor: `${st.color}18`,
      color: st.color,
      borderColor: `${st.color}50`
    } : undefined;

    const customDotStyle = isHex ? {
      backgroundColor: st.color
    } : undefined;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap shadow-2xs ${isHex ? '' : styleObj.pill}`}
        style={customStyle}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHex ? '' : styleObj.dot}`}
          style={customDotStyle}
        />
        <span>{st.name}</span>
      </span>
    );
  };

  const renderTemplateCategoryPill = (c) => {
    let hex = c.color || '#2563EB';
    const colorMap = {
      blue: '#2563EB',
      emerald: '#059669',
      green: '#059669',
      amber: '#D97706',
      orange: '#D97706',
      purple: '#9333EA',
      violet: '#9333EA',
      rose: '#E11D48',
      red: '#E11D48',
      cyan: '#0891B2',
      teal: '#0D9488',
      indigo: '#4F46E5',
      slate: '#64748B'
    };

    if (colorMap[hex.toLowerCase()]) {
      hex = colorMap[hex.toLowerCase()];
    }

    const isHex = hex.startsWith('#');

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap shadow-2xs"
        style={{
          backgroundColor: isHex ? `${hex}18` : undefined,
          color: isHex ? hex : undefined,
          borderColor: isHex ? `${hex}45` : undefined,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: hex }}
        />
        <span>{c.name}</span>
      </span>
    );
  };
  const renderBlueprintCategoryPill = renderTemplateCategoryPill;

  const renderScopeBadge = (scope) => {
    if (scope === 'Project') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800 shadow-2xs">
          <FolderGit2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>Project Lifecycles</span>
        </span>
      );
    }
    if (scope === 'Global') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
          <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Global Lifecycles</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800 shadow-2xs">
        <CheckSquare className="w-3 h-3 text-sky-600 dark:text-sky-400" />
        <span>Task Lifecycles</span>
      </span>
    );
  };

  const renderStatusIcon = (iconName, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'PlayCircle': return <PlayCircle className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'AlertOctagon': return <AlertOctagon className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'PauseCircle': return <PauseCircle className={className} />;
      case 'CircleDot': return <CircleDot className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'FolderGit2': return <FolderGit2 className={className} />;
      case 'Archive': return <Archive className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Flame': return <Flame className={className} />;
      default: return <CircleDot className={className} />;
    }
  };

  const renderBehaviorBadge = (st) => {
    const isCompleted = Boolean(st.marksAsCompleted || st.behavior === 'completed');
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Triggers Strikethrough &amp; 100% Done</span>
        </span>
      );
    }
    if (st.behavior === 'inprogress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0 shadow-2xs">
          <PlayCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Active Sprint Execution</span>
        </span>
      );
    }
    if (st.behavior === 'review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>QA Review &amp; Sign-off</span>
        </span>
      );
    }
    if (st.behavior === 'blocked') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0 shadow-2xs">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Blocked &amp; Escalation Needed</span>
        </span>
      );
    }
    if (st.behavior === 'paused') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0 shadow-2xs">
          <PauseCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>On Hold / Paused Priorities</span>
        </span>
      );
    }
    if (st.behavior === 'backlog') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
          <CircleDot className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Backlog / Planning State</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
        <CircleDot className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Standard Execution State</span>
      </span>
    );
  };

  return (
    <div className="space-y-5 pb-16 text-xs select-none w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-light/30 text-brand flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Master Data
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise tabular management center. Complete Add, Edit, Delete, and Deactivate/Archive capabilities across all master entities.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'users'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Users ({users?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'roles'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Access Control ({rolesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('statuses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'statuses'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <Tag className="w-4 h-4" />
          <span>Statuses ({statusesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brands')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'brands'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({brandsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'categories'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Link Categories ({catsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('template-categories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'template-categories' || activeTab === 'blueprint-categories'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Template Categories ({(blueprintCategories || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'departments'
            ? 'bg-brand text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({depsList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. USERS MASTER TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user master by name, email, or department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">All Roles</option>
                {rolesList.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
                <option value="Archived">Archived</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({
                    name: '',
                    email: '',
                    role: 'User',
                    department: depsList[0]?.name || 'Frontend Engineering',
                    phone: '',
                    status: 'Active',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                    isDepartmentLead: false
                  });
                  setIsUserModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">User Member</th>
                    <th className="py-3 px-4">Email &amp; Phone</th>
                    <th className="py-3 px-4">Department &amp; TL</th>
                    <th className="py-3 px-4">Access Role</th>
                    <th className="py-3 px-4">Status State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = u.id === currentUser?.id;
                      const deptInfo = depsList.find((d) => d.name === u.department);
                      const isDeptTL = deptInfo && deptInfo.lead === u.name;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={u} size="md" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  {u.name}
                                  {isCurrent && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-brand-light text-brand-text rounded font-bold">
                                      CURRENT
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">ID: {u.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{u.email}</span>
                              <span className="text-[10px] text-slate-400">{u.phone || 'No phone'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{u.department}</span>
                              {isDeptTL && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span>Dept TL</span>
                                </span>
                              )}
                            </div>
                            {!isDeptTL && deptInfo?.lead && deptInfo.lead !== 'Unassigned' && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                TL: <span className="font-medium text-slate-600 dark:text-slate-300">{deptInfo.lead}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <RoleBadge role={u.role} size="xs" />
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderStatusBadge(u.status || 'Active')}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  const isLeadOfDept = depsList.some((d) => d.name === u.department && d.lead === u.name);
                                  setUserForm({
                                    name: u.name || '',
                                    email: u.email || '',
                                    role: u.role || 'User',
                                    department: u.department || 'Frontend Engineering',
                                    phone: u.phone || '',
                                    status: u.status || 'Active',
                                    avatar: u.avatar || '',
                                    isDepartmentLead: isLeadOfDept
                                  });
                                  setIsUserModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                title="Edit User"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Archive / Deactivate Action */}
                              <button
                                type="button"
                                onClick={() => handleToggleUserArchive(u)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded transition-colors"
                                title={u.status === 'Active' ? 'Deactivate User' : u.status === 'Deactivated' ? 'Archive User' : 'Activate User'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (handleDeleteUser) handleDeleteUser(u.id || u._id);
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (setCurrentUser) setCurrentUser(u);
                                  }}
                                  className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded bg-brand-subtle text-brand hover:bg-brand-light border border-brand-border transition-colors"
                                  title="Simulate User"
                                >
                                  Simulate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ROLES & ACCESS CONTROL MASTER (UNIFIED TIT-TO-BIT GOVERNANCE) */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="pt-2">
          <AccessControlView isEmbedded={true} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STATUSES MASTER TABLE (GROUPED BY SCOPE CATEGORY) */}
      {/* ========================================================================= */}
      {activeTab === 'statuses' && (
        <div className="space-y-4">
          {/* Scope Category Navigation Tabs & Header */}
          <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand" />
                  <span>Lifecycle Status Master by Scope Category</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Categorized lifecycle states governing tasks, deliverables, and project health workflows
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStatus(null);
                  setStatusForm({
                    name: '',
                    scope: statusScopeFilter === 'ALL' ? 'Task' : statusScopeFilter,
                    behavior: 'completed',
                    marksAsCompleted: true,
                    color: 'emerald',
                    icon: 'CheckCircle2',
                    status: 'Active',
                    desc: ''
                  });
                  setIsStatusModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Status</span>
              </button>
            </div>

            {/* Scope Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusScopeFilter('ALL')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${statusScopeFilter === 'ALL'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                <span>All Scope Categories</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${statusScopeFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                  {statusesList.length}
                </span>
              </button>

              {SCOPE_CATEGORIES.map((cat) => {
                const count = statusesList.filter((s) => s.scope === cat.id).length;
                const CatIcon = cat.icon;
                const isSelected = statusScopeFilter === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setStatusScopeFilter(cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${isSelected
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar */}
            <div className="relative pt-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search statuses by name, behavioral category, or description..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Categorized Sections */}
          <div className="space-y-4">
            {SCOPE_CATEGORIES.filter((cat) => statusScopeFilter === 'ALL' || statusScopeFilter === cat.id).map((cat) => {
              const CatIcon = cat.icon;
              const catStatuses = statusesList
                .filter((s) => s.scope === cat.id)
                .filter((s) => {
                  if (!statusSearch.trim()) return true;
                  const q = statusSearch.toLowerCase();
                  return s.name.toLowerCase().includes(q) || (s.desc || '').toLowerCase().includes(q);
                });

              if (statusScopeFilter === 'ALL' && catStatuses.length === 0 && statusSearch.trim()) {
                return null;
              }

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden"
                >
                  {/* Scope Category Header Banner */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {cat.name} Category
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {catStatuses.length} {catStatuses.length === 1 ? 'Status' : 'Statuses'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cat.desc}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingStatus(null);
                        setStatusForm({
                          name: '',
                          scope: cat.id,
                          behavior: 'completed',
                          marksAsCompleted: true,
                          color: 'emerald',
                          icon: 'CheckCircle2',
                          status: 'Active',
                          desc: ''
                        });
                        setIsStatusModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand hover:text-brand-hover bg-brand/5 hover:bg-brand/10 rounded-md border border-brand/20 transition-colors self-end sm:self-auto"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add {cat.id} Status</span>
                    </button>
                  </div>

                  {/* Scope Category Status Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-4 min-w-[200px]">Status</th>
                          <th className="py-2.5 px-4">Description</th>
                          <th className="py-2.5 px-4">State</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {catStatuses.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 font-medium">
                              No statuses in {cat.name} matching your search.
                            </td>
                          </tr>
                        ) : (
                          catStatuses.map((st) => (
                            <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 whitespace-nowrap">
                                {renderStatusPill(st)}
                              </td>

                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[280px] truncate" title={st.desc}>
                                {st.desc || '-'}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {renderStatusBadge(st.status)}
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Quick Toggle Strikethrough Action */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatusStrikethrough(st)}
                                    className={`p-1.5 rounded-md transition-colors border ${st.marksAsCompleted
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
                                      }`}
                                    title={st.marksAsCompleted ? 'Strikethrough is Active (Click to disable)' : 'Enable Strikethrough for this status'}
                                  >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Edit Action */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStatus(st);
                                      setStatusForm({
                                        name: st.name || '',
                                        scope: st.scope || 'Task',
                                        behavior: st.behavior || (st.marksAsCompleted ? 'completed' : 'normal'),
                                        marksAsCompleted: Boolean(st.marksAsCompleted),
                                        color: st.color || 'blue',
                                        icon: st.icon || (st.marksAsCompleted ? 'CheckCircle2' : 'CircleDot'),
                                        status: st.status || 'Active',
                                        desc: st.desc || ''
                                      });
                                      setIsStatusModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                    title="Edit Status Configuration"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Deactivate / Archive Action */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatusArchive(st)}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-md transition-colors"
                                    title={st.status === 'Active' ? 'Deactivate Status' : 'Activate Status'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Action */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStatus(st)}
                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md transition-colors"
                                    title="Delete Status"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PROJECT BRANDS MASTER TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search brands by code, title, or mandate scope..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingBrand(null);
                setBrandForm({ code: '', name: '', color: '#2563EB', status: 'Active', desc: '' });
                setIsBrandModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand / Project Name</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Brand Code</th>
                    <th className="py-3 px-4">Project / Brand Name</th>
                    <th className="py-3 px-4">Brand Color Scheme</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No brands found
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="px-2 py-0.5 font-mono font-bold text-white rounded shadow-xs"
                            style={getBrandColorStyle(b.color)}
                          >
                            [{b.code}]
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {b.name}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                              style={getBrandColorStyle(b.color)}
                            />
                            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">{b.color}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {b.desc}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderStatusBadge(b.status)}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBrand(b);
                                setBrandForm({ ...b });
                                setIsBrandModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Edit Brand"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Deactivate / Archive Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleBrandArchive(b)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded transition-colors"
                              title={b.status === 'Active' ? 'Deactivate Brand' : 'Activate Brand'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBrand(b)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                              title="Delete Brand"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LINK CATEGORIES MASTER TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search link categories master..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCat(null);
                setCatForm({ name: '', count: 0, status: 'Active', desc: '' });
                setIsCatModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link Category</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Assigned Subcategories / Items</th>
                    <th className="py-3 px-4">Description Scope</th>
                    <th className="py-3 px-4">Status State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No link categories found
                      </td>
                    </tr>
                  ) : (
                    filteredCats.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {c.name}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold border border-slate-200 dark:border-slate-700">
                            {c.count} items configured
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {c.desc}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderStatusBadge(c.status)}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCat(c);
                                setCatForm({ ...c });
                                setIsCatModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Edit Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Deactivate / Archive Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleCatArchive(c)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded transition-colors"
                              title={c.status === 'Active' ? 'Deactivate Category' : 'Activate Category'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCat(c)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5.5. TEMPLATE CATEGORIES MASTER TABLE */}
      {/* ========================================================================= */}
      {(activeTab === 'template-categories' || activeTab === 'blueprint-categories') && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search template categories master by name, code, or description..."
                value={blueprintCatSearch}
                onChange={(e) => setBlueprintCatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={blueprintCatStatusFilter}
                onChange={(e) => setBlueprintCatStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setEditingBlueprintCat(null);
                  setBlueprintCatForm({
                    name: '',
                    code: '',
                    color: '#2563EB',
                    status: 'Active',
                    description: ''
                  });
                  setIsBlueprintCatModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Template Category</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[180px]">Category</th>
                    <th className="py-3 px-4">Associated Templates</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBlueprintCats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No template categories found
                      </td>
                    </tr>
                  ) : (
                    filteredBlueprintCats.map((c) => {
                      const count = (templates || []).filter((t) => t.category === c.name).length;
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderTemplateCategoryPill(c)}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold border ${
                              count > 0
                                ? 'bg-brand-light/30 text-brand border-brand/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}>
                              {count} {count === 1 ? 'template' : 'templates'} using this
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={c.description}>
                            {c.description || '-'}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderStatusBadge(c.status || 'Active')}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBlueprintCat(c);
                                  setBlueprintCatForm({
                                    name: c.name,
                                    code: c.code || '',
                                    color: c.color || '#2563EB',
                                    status: c.status || 'Active',
                                    description: c.description || ''
                                  });
                                  setIsBlueprintCatModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                title="Edit Template Category"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active / Archived */}
                              <button
                                type="button"
                                onClick={() => handleToggleBlueprintCatArchive(c)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded transition-colors"
                                title={c.status === 'Active' ? 'Archive Category' : 'Activate Category'}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Action */}
                              <button
                                type="button"
                                onClick={() => handleDeleteBlueprintCat(c)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                                title="Delete Template Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DEPARTMENTS MASTER TABLE */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-3.5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search departments by name, code, or lead..."
                value={depSearch}
                onChange={(e) => setDepSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-brand text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingDep(null);
                setDepForm({ code: '', name: '', lead: '', members: 0, status: 'Active' });
                setIsDepModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Department Code</th>
                    <th className="py-3 px-4">Department Title</th>
                    <th className="py-3 px-4">Department Lead</th>
                    <th className="py-3 px-4">Active Headcount</th>
                    <th className="py-3 px-4">Status State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDeps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No departments found
                      </td>
                    </tr>
                  ) : (
                    filteredDeps.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {d.code}
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {d.name}
                        </td>

                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {d.lead && d.lead !== 'Unassigned' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                👑
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{d.lead}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono font-medium">
                                TL
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold border border-slate-200 dark:border-slate-700">
                            {(users || []).filter((u) => u.department === d.name).length} active members
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderStatusBadge(d.status)}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDep(d);
                                setDepForm({ ...d });
                                setIsDepModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Edit Department"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Deactivate / Archive Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleDepArchive(d)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded transition-colors"
                              title={d.status === 'Active' ? 'Deactivate Department' : 'Activate Department'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleDeleteDep(d)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT USER */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {editingUser ? <Pencil className="w-4 h-4 text-brand" /> : <Plus className="w-4 h-4 text-brand" />}
                <span>{editingUser ? 'Edit User Master' : 'Add User Master'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maya.lin@pulsepm.io"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Access Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Department
                  </label>
                  <select
                    value={userForm.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const deptData = depsList.find((d) => d.name === newDept);
                      const isAlreadyLead = editingUser && deptData?.lead === editingUser.name;
                      setUserForm({
                        ...userForm,
                        department: newDept,
                        isDepartmentLead: Boolean(isAlreadyLead)
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                  >
                    {depsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} {d.lead && d.lead !== 'Unassigned' ? `(TL: ${d.lead})` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Dependent TL Dynamic Indicator */}
                  {(() => {
                    const selDept = depsList.find((d) => d.name === userForm.department);
                    return (
                      <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/70 dark:border-slate-700/70 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Department TL:</span>
                          {selDept?.lead && selDept.lead !== 'Unassigned' ? (
                            <span className="font-bold text-brand flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-500" />
                              <span>{selDept.lead}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No TL currently assigned</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* TL Assignment Checkbox */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="setAsDeptLead"
                  checked={Boolean(userForm.isDepartmentLead)}
                  onChange={(e) => setUserForm({ ...userForm, isDepartmentLead: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                />
                <label htmlFor="setAsDeptLead" className="cursor-pointer text-xs select-none flex-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Set as Department Team Lead (TL)</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-tight">
                    Designates {userForm.name.trim() || 'this user'} as the official TL for <strong>{userForm.department}</strong> in Department Master.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Account Status
                  </label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs"
                >
                  {editingUser ? 'Update User' : 'Save User Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ROLE */}
      {/* ========================================================================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>{editingRole ? 'Edit Custom Role' : 'Add Custom Role'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Auditor"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Role mandate..."
                  value={roleForm.desc}
                  onChange={(e) => setRoleForm({ ...roleForm, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Status State
                </label>
                <select
                  value={roleForm.status}
                  onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs"
                >
                  {editingRole ? 'Update Role' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STATUS */}
      {/* ========================================================================= */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand" />
                <span>{editingStatus ? 'Edit Master Status Configuration' : 'Add Master Status Configuration'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              {/* Name & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Status Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Completed, Done, QA Review"
                    value={statusForm.name}
                    onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Scope Category
                  </label>
                  <select
                    value={statusForm.scope}
                    onChange={(e) => setStatusForm({ ...statusForm, scope: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                  >
                    <option value="Task">Task Lifecycles Category</option>
                    <option value="Project">Project Lifecycles Category</option>
                    <option value="Global">Global Lifecycles (Task & Project)</option>
                  </select>
                </div>
              </div>

              {/* Key Behavioral Role & Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Key Behavioral Action / Category
                </label>
                <select
                  value={statusForm.behavior || 'normal'}
                  onChange={(e) => {
                    const bId = e.target.value;
                    const preset = BEHAVIOR_PRESETS.find((p) => p.id === bId);
                    if (preset) {
                      setStatusForm({
                        ...statusForm,
                        behavior: bId,
                        marksAsCompleted: preset.marksAsCompleted,
                        color: preset.defaultColor,
                        icon: preset.defaultIcon
                      });
                    } else {
                      setStatusForm({ ...statusForm, behavior: bId });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                >
                  {BEHAVIOR_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {BEHAVIOR_PRESETS.find((p) => p.id === statusForm.behavior)?.desc || 'Defines default system actions and badge styles.'}
                </p>
              </div>

              {/* Automation Trigger: Strikethrough Action Configuration */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="marksAsCompletedTrigger"
                    checked={Boolean(statusForm.marksAsCompleted)}
                    onChange={(e) => setStatusForm({ ...statusForm, marksAsCompleted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="marksAsCompletedTrigger" className="cursor-pointer text-xs select-none flex-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Action Trigger: Apply Strikethrough &amp; Resolved design</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
                      When any project task or child subtask is placed in this status, its title will automatically show with <strong>strikethrough styling</strong> and marked as 100% completed across the web application.
                    </span>
                  </label>
                </div>
              </div>

              {/* Status Recognition Icon */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Visual Recognition Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  {STATUS_ICON_OPTIONS.map((ic) => {
                    const isSel = (statusForm.icon || 'CircleDot') === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => setStatusForm({ ...statusForm, icon: ic.id })}
                        title={ic.label}
                        className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all cursor-pointer ${isSel
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/60'
                          }`}
                      >
                        {renderStatusIcon(ic.id, 'w-4 h-4')}
                        <span className="text-[9px] mt-1 font-mono truncate max-w-full">{ic.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Swatch & Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Color Swatch &amp; Theme
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUS_COLOR_OPTIONS.map((c) => {
                    const isSel = statusForm.color === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setStatusForm({ ...statusForm, color: c.id })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${isSel
                          ? 'ring-2 ring-brand ring-offset-1 border-slate-900 dark:border-slate-100 font-bold bg-white dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400'
                          }`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: c.hex }} />
                        <span className="capitalize text-[11px]">{c.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Usage Context &amp; Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. For tasks that completed QA testing and are ready for deployment"
                  value={statusForm.desc}
                  onChange={(e) => setStatusForm({ ...statusForm, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                />
              </div>

              {/* Status State */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Status State
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs cursor-pointer"
                >
                  {editingStatus ? 'Update Status Configuration' : 'Save Status Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BRAND */}
      {/* ========================================================================= */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-brand" />
                <span>{editingBrand ? 'Edit Project Brand' : 'Add Project Brand'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AUR"
                    value={brandForm.code}
                    onChange={(e) => setBrandForm({ ...brandForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Aura FinTech"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Mandate scope..."
                  value={brandForm.desc}
                  onChange={(e) => setBrandForm({ ...brandForm, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Brand / Project Accent Color (Color Picker)
                </label>
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={brandForm.color?.startsWith('#') ? brandForm.color : '#2563EB'}
                      onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="#2563EB"
                        value={brandForm.color}
                        onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                    {BRAND_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, color: preset.hex })}
                        style={{ backgroundColor: preset.hex }}
                        className={`w-4.5 h-4.5 rounded-full transition-transform ${brandForm.color?.toLowerCase() === preset.hex.toLowerCase()
                          ? 'scale-125 ring-2 ring-brand ring-offset-1'
                          : 'hover:scale-110'
                          }`}
                        title={preset.name}
                      />
                    ))}
                  </div>

                  {/* Live preview badge */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Badge Preview:</span>
                    <span
                      className="px-2.5 py-1 font-mono text-xs font-bold text-white rounded shadow-xs"
                      style={getBrandColorStyle(brandForm.color)}
                    >
                      [{brandForm.code || 'CODE'}] {brandForm.name || 'Brand Name'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Status State
                </label>
                <select
                  value={brandForm.status}
                  onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs"
                >
                  {editingBrand ? 'Update Brand' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT LINK CATEGORY */}
      {/* ========================================================================= */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-brand" />
                <span>{editingCat ? 'Edit Link Category' : 'Add Link Category'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Category Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Portals"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Scope of links..."
                  value={catForm.desc}
                  onChange={(e) => setCatForm({ ...catForm, desc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Status State
                </label>
                <select
                  value={catForm.status}
                  onChange={(e) => setCatForm({ ...catForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs"
                >
                  {editingCat ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {isDepModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand" />
                <span>{editingDep ? 'Edit Department' : 'Add Department'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDepModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MKT"
                    value={depForm.code}
                    onChange={(e) => setDepForm({ ...depForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Growth & Marketing"
                    value={depForm.name}
                    onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Department Team Lead (TL)
                  </label>
                  <span className="text-[10px] text-slate-400">Assigned from users</span>
                </div>
                <select
                  value={depForm.lead || 'Unassigned'}
                  onChange={(e) => setDepForm({ ...depForm, lead: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand font-medium"
                >
                  <option value="Unassigned">-- Unassigned --</option>
                  <optgroup label="Managers & Team Leads">
                    {(users || [])
                      .filter((u) => u.role === 'Manager / TL' || u.role === 'Super Admin' || u.role === 'Admin')
                      .map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role} - {u.department || 'No dept'})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="All Other Members">
                    {(users || [])
                      .filter((u) => u.role !== 'Manager / TL' && u.role !== 'Super Admin' && u.role !== 'Admin')
                      .map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role} - {u.department || 'No dept'})
                        </option>
                      ))}
                  </optgroup>
                </select>
                {depForm.lead && depForm.lead !== 'Unassigned' && (
                  <p className="text-[11px] text-brand mt-1.5 flex items-center gap-1 font-medium">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Designated TL: <strong>{depForm.lead}</strong> will lead {depForm.name || 'this department'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Status State
                </label>
                <select
                  value={depForm.status}
                  onChange={(e) => setDepForm({ ...depForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDepModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs"
                >
                  {editingDep ? 'Update Department' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TEMPLATE CATEGORY */}
      {/* ========================================================================= */}
      {isBlueprintCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                <span>{editingBlueprintCat ? 'Edit Template Category' : 'Add Template Category'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBlueprintCatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBlueprintCatSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="WEB"
                    value={blueprintCatForm.code}
                    onChange={(e) => setBlueprintCatForm({ ...blueprintCatForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Artificial Intelligence & ML"
                    value={blueprintCatForm.name}
                    onChange={(e) => setBlueprintCatForm({ ...blueprintCatForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline sprint templates covered by this category..."
                  value={blueprintCatForm.description}
                  onChange={(e) => setBlueprintCatForm({ ...blueprintCatForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Accent Color
                </label>
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={blueprintCatForm.color?.startsWith('#') ? blueprintCatForm.color : '#2563EB'}
                      onChange={(e) => setBlueprintCatForm({ ...blueprintCatForm, color: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-transparent shrink-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="#2563EB"
                        value={blueprintCatForm.color}
                        onChange={(e) => setBlueprintCatForm({ ...blueprintCatForm, color: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                    {BRAND_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setBlueprintCatForm({ ...blueprintCatForm, color: preset.hex })}
                        style={{ backgroundColor: preset.hex }}
                        className={`w-4.5 h-4.5 rounded-full transition-transform ${blueprintCatForm.color?.toLowerCase() === preset.hex.toLowerCase()
                          ? 'scale-125 ring-2 ring-brand ring-offset-1'
                          : 'hover:scale-110'
                          }`}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Status State
                </label>
                <select
                  value={blueprintCatForm.status}
                  onChange={(e) => setBlueprintCatForm({ ...blueprintCatForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBlueprintCatModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs"
                >
                  {editingBlueprintCat ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
