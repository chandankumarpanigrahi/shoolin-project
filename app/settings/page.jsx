'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/components/providers/AppProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useToast } from '@/components/common/Toast';
import { useUrlTab } from '@/hooks/useUrlState';
import {
  Camera,
  Sun,
  Moon,
  Check,
  Building2,
  UserCheck,
  Palette,
  Sparkles,
  Settings,
  ShieldCheck,
  Bell,
  Monitor,
  Save,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Lock,
  Globe,
  Sliders,
  Layers,
  HelpCircle,
  Smartphone,
  Send,
  Clock,
  Zap,
  Calendar,
  AlertTriangle,
  Mail,
  MessageSquare,
  Volume2,
  VolumeX,
} from 'lucide-react';

// ─── Sidebar Navigation Tabs ──────────────────────────────────────────────────
const TABS = [
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Themes & brand colors' },
  { id: 'profile', label: 'Profile', icon: UserCheck, desc: 'Identity & preferences' },
  { id: 'workspace', label: 'Workspace', icon: Building2, desc: 'Organization & tenant' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & communications' },
  { id: 'display', label: 'Display & Density', icon: Monitor, desc: 'Layout & interface density' },
  { id: 'security', label: 'Security & Data', icon: ShieldCheck, desc: 'Sessions, audit & backups' },
];

// ─── Clean Section Card Wrapper with Optional Save Footer ─────────────────────
function SectionCard({
  title,
  description,
  icon: Icon,
  badge,
  children,
  isDirty = false,
  onSave,
  onReset,
  saveLabel = 'Save Changes',
  showFooterSave = true,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-light/30 dark:bg-brand/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-brand" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h2>
              {badge}
            </div>
            {description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Save in Card Header if Dirty */}
        {isDirty && onSave && (
          <button
            type="button"
            onClick={onSave}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">{children}</div>

      {/* Card Action Footer */}
      {showFooterSave && onSave && (
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                All settings up to date
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                disabled={!isDirty}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs ${
                isDirty
                  ? 'bg-brand hover:bg-brand-hover text-white ring-2 ring-brand/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {saveLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Floating Sticky Bottom Save Dock ─────────────────────────────────────────
function StickySaveDock({ isDirty, onSave, onReset, activeTabLabel }) {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold">
            Unsaved changes in {activeTabLabel}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-700 dark:bg-slate-300 mx-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-black transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 1. Appearance Tab ────────────────────────────────────────────────────────
function AppearanceTab({ toast }) {
  const { theme, toggleTheme, brandColor, changeBrandColor, BRAND_COLOR_PRESETS } = useAppContext();
  const [customHex, setCustomHex] = useState(brandColor.startsWith('#') ? brandColor : '#4f46e5');
  const [dirty, setDirty] = useState(false);

  const handleApplyColor = (colorIdOrHex) => {
    changeBrandColor(colorIdOrHex);
    setDirty(true);
  };

  const handleSaveDefaults = () => {
    try {
      localStorage.setItem('pulsepm_brand_color', brandColor);
      localStorage.setItem('pulsepm_theme', theme);
      setDirty(false);
      toast.success('Appearance defaults saved and locked!');
    } catch {
      toast.error('Unable to access localStorage.');
    }
  };

  const handleResetDefaults = () => {
    changeBrandColor('indigo');
    setDirty(false);
    toast.info('Appearance reset to Indigo preset.');
  };

  return (
    <div className="space-y-5">
      {/* Theme Mode Card */}
      <SectionCard
        title="Interface Theme"
        description="Choose between high-contrast dark mode or clean paper light mode"
        icon={theme === 'dark' ? Moon : Sun}
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
            {theme.toUpperCase()}
          </span>
        }
        showFooterSave={false}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'light',
              label: 'Light Mode',
              desc: 'Crisp, high-contrast white & slate paper aesthetic',
              iconBg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700',
              icon: <Sun className="w-5 h-5" />,
            },
            {
              id: 'dark',
              label: 'Dark Mode',
              desc: 'Deep space OLED black & navy slate ergonomic theme',
              iconBg: 'bg-slate-800 text-brand border border-slate-700',
              icon: <Moon className="w-5 h-5" />,
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (theme !== opt.id) {
                  toggleTheme();
                  setDirty(true);
                  toast.info(`Switched to ${opt.label}`);
                }
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between w-full text-left group ${
                theme === opt.id
                  ? 'border-brand bg-brand-subtle shadow-xs ring-1 ring-brand/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-brand/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${opt.iconBg} transition-transform group-hover:scale-105`}>
                  {opt.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{opt.label}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{opt.desc}</p>
                </div>
              </div>
              {theme === opt.id && (
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Brand Color Architecture Card */}
      <SectionCard
        title="Brand Color Architecture"
        description="Dynamic CSS custom variables controlling buttons, focus outlines, and accents"
        icon={Palette}
        badge={
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand-light text-brand-text font-bold border border-brand-border">
            {brandColor.startsWith('#') ? brandColor.toUpperCase() : brandColor}
          </span>
        }
        isDirty={dirty}
        onSave={handleSaveDefaults}
        onReset={handleResetDefaults}
        saveLabel="Save Theme & Brand"
      >
        <div className="space-y-4">
          {/* Preset Swatches */}
          <div>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2.5 uppercase tracking-wide">
              Curated Enterprise Palettes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {BRAND_COLOR_PRESETS.map((preset) => {
                const isSelected =
                  brandColor === preset.id ||
                  brandColor.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      handleApplyColor(preset.id);
                      toast.success(`Active palette: ${preset.name}`);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all group ${
                      isSelected
                        ? 'border-brand bg-brand-subtle shadow-xs scale-102'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.primary }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Generator */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2.5 uppercase tracking-wide">
              Custom Hex Specifier
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#4F46E5"
                  className="w-24 bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (/^#[0-9A-F]{6}$/i.test(customHex)) {
                    handleApplyColor(customHex);
                    toast.success('Custom hex color applied live!');
                  } else {
                    toast.error('Enter a valid 6-digit hex color like #2563EB');
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Hex
              </button>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Immediately updates <code className="font-mono text-xs">--brand-primary</code> live across all UI components.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── 2. Profile Tab ───────────────────────────────────────────────────────────
function ProfileTab({ toast }) {
  const { currentUser, setCurrentUser, users, setUsers, openChangeDpModal, setIsAuthOpen } = useAppContext();

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '+91 98765 43210',
    timezone: currentUser?.timezone || 'Asia/Kolkata',
    department: currentUser?.department || 'Executive Office',
    bio: currentUser?.bio || 'Operations and enterprise strategy lead at Shoolin Innovations.',
  });

  const [dirty, setDirty] = useState(false);

  // Sync if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '+91 98765 43210',
        timezone: currentUser.timezone || 'Asia/Kolkata',
        department: currentUser.department || 'Executive Office',
        bio: currentUser.bio || 'Operations and enterprise strategy lead at Shoolin Innovations.',
      });
    }
  }, [currentUser]);

  const update = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      timezone: form.timezone,
      department: form.department,
      bio: form.bio,
    };

    // Update current user
    setCurrentUser(updatedUser);

    // Update in users array
    if (users && setUsers) {
      const newUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
      setUsers(newUsers);
      try {
        localStorage.setItem('pulsepm_users', JSON.stringify(newUsers));
      } catch (e) {
        console.error(e);
      }
    }

    setDirty(false);
    toast.success('Profile details successfully updated and synchronized!');
  };

  const handleDiscard = () => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        timezone: currentUser.timezone || 'Asia/Kolkata',
        department: currentUser.department || '',
        bio: currentUser.bio || '',
      });
    }
    setDirty(false);
    toast.info('Changes discarded.');
  };

  return (
    <div className="space-y-5">
      {/* Identity Card */}
      <SectionCard
        title="Public Identity & Avatar"
        description="How you appear on assigned tasks, timeline logs, and project collaboration threads"
        icon={UserCheck}
        showFooterSave={false}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar with Overlay */}
          <div
            className="relative group cursor-pointer shrink-0 self-start sm:self-auto"
            onClick={() => openChangeDpModal(currentUser)}
            title="Click to change profile picture"
          >
            <UserAvatar user={currentUser} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-brand border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          {/* Identity Meta & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{currentUser.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand-text">
                {currentUser.role}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Department: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{currentUser.department}</strong>
            </p>

            <div className="flex items-center gap-2.5 mt-3.5 flex-wrap">
              <button
                type="button"
                onClick={() => openChangeDpModal(currentUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                Update Photo
              </button>
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand" />
                Switch Active User
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Personal Information Form Card with Save Bar */}
      <SectionCard
        title="Personal Profile & Preferences"
        description="Manage your contact details, enterprise handle, and regional timezone"
        icon={UserCheck}
        isDirty={dirty}
        onSave={handleSave}
        onReset={handleDiscard}
        saveLabel="Save Profile Details"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Full Legal / Display Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Work Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="name@shoolin.com"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Active Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                {['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Dubai', 'Asia/Singapore'].map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Bio & Role Summary
            </label>
            <textarea
              rows={2}
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              placeholder="Brief professional note..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── 3. Workspace Tab ─────────────────────────────────────────────────────────
function WorkspaceTab({ toast }) {
  const [form, setForm] = useState({
    orgName: 'Shoolin Innovations Limited',
    taskPrefix: 'SHL',
    fiscalYear: 'April–March',
    maxProjects: '50',
    timezone: 'Asia/Kolkata',
    language: 'English (US)',
    supportEmail: 'ops@shoolin-innovations.com',
  });

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoolin_workspace_settings');
      if (saved) {
        setForm(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const update = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('shoolin_workspace_settings', JSON.stringify(form));
      setDirty(false);
      toast.success('Workspace parameters saved successfully!');
    } catch {
      toast.error('Failed to save to localStorage.');
    }
  };

  const handleDiscard = () => {
    try {
      const saved = localStorage.getItem('shoolin_workspace_settings');
      if (saved) setForm(JSON.parse(saved));
    } catch {}
    setDirty(false);
    toast.info('Workspace changes reverted.');
  };

  return (
    <div className="space-y-5">
      {/* Organization Parameters */}
      <SectionCard
        title="Organization & Tenant Parameters"
        description="Global workspace identity, default task numbering scheme, and tenant routing"
        icon={Building2}
        isDirty={dirty}
        onSave={handleSave}
        onReset={handleDiscard}
        saveLabel="Save Organization Parameters"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Organization Name
            </label>
            <input
              type="text"
              value={form.orgName}
              onChange={(e) => update('orgName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Default Task Code Prefix
            </label>
            <input
              type="text"
              value={form.taskPrefix}
              onChange={(e) => update('taskPrefix', e.target.value.toUpperCase())}
              placeholder="SHL"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Fiscal Year Financial Cycle
            </label>
            <select
              value={form.fiscalYear}
              onChange={(e) => update('fiscalYear', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {['April–March', 'January–December', 'July–June', 'October–September'].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Max Active Concurrent Projects
            </label>
            <input
              type="number"
              value={form.maxProjects}
              onChange={(e) => update('maxProjects', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Tenant Support Email
            </label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => update('supportEmail', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              Interface Default Language
            </label>
            <select
              value={form.language}
              onChange={(e) => update('language', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {['English (US)', 'English (UK)', 'Hindi', 'Arabic', 'Spanish', 'French', 'German'].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── 4. Notifications Tab ─────────────────────────────────────────────────────
const DEFAULT_NOTIFICATION_RULES = [
  {
    id: 'task_assigned',
    title: 'Task Assigned or Delegated',
    desc: 'Triggered when an action item or project mandate is delegated to you',
    icon: Zap,
    push: true,
    inApp: true,
    email: false,
    timing: 'immediate',
    timingOptions: [{ value: 'immediate', label: 'Immediately upon assignment' }],
    badge: 'Delegation',
  },
  {
    id: 'task_deadline',
    title: 'Approaching Task Deadline',
    desc: 'Advance warning before scheduled target completion date expires',
    icon: Clock,
    push: true,
    inApp: true,
    email: true,
    timing: '24h_before',
    timingOptions: [
      { value: '1h_before', label: '1 Hour Before' },
      { value: '24h_before', label: '24 Hours Before' },
      { value: 'morning_due', label: 'Morning of Due Date (09:00 AM)' },
      { value: '3d_before', label: '3 Days Before' },
    ],
    badge: 'Schedule',
  },
  {
    id: 'task_overdue',
    title: 'Critical Task Overdue Alert',
    desc: 'Escalation triggered when target deadline passes without completion',
    icon: AlertTriangle,
    push: true,
    inApp: true,
    email: true,
    timing: 'immediate',
    timingOptions: [
      { value: 'immediate', label: 'Immediate upon breach' },
      { value: 'daily_10am', label: 'Daily at 10:00 AM' },
      { value: 'twice_daily', label: 'Twice Daily (10 AM & 4 PM)' },
    ],
    badge: 'Escalation',
  },
  {
    id: 'dependency_blocked',
    title: 'Critical Upstream Blocker',
    desc: 'Urgent notification when an upstream dependent task stalls your work',
    icon: AlertCircle,
    push: true,
    inApp: true,
    email: true,
    timing: 'immediate',
    timingOptions: [{ value: 'immediate', label: 'Immediate (High Priority Alert)' }],
    badge: 'Blocker',
  },
  {
    id: 'dependency_cleared',
    title: 'Blocker Cleared / Unblocked',
    desc: 'Immediate dispatch when an upstream prerequisite task is completed',
    icon: CheckCircle2,
    push: true,
    inApp: true,
    email: false,
    timing: 'immediate',
    timingOptions: [{ value: 'immediate', label: 'Immediate upon resolution' }],
    badge: 'Resolution',
  },
  {
    id: 'meeting_reminder',
    title: 'Meeting & Standup Reminder',
    desc: 'Automated countdown alert with one-click direct join link',
    icon: Calendar,
    push: true,
    inApp: true,
    email: false,
    timing: '15m_before',
    timingOptions: [
      { value: '5m_before', label: '5 Minutes Before' },
      { value: '15m_before', label: '15 Minutes Before' },
      { value: '30m_before', label: '30 Minutes Before' },
      { value: '1h_before', label: '1 Hour Before' },
    ],
    badge: 'Calendar',
  },
  {
    id: 'project_milestone',
    title: 'Project Milestone & Phase Completion',
    desc: 'Alert when a project stage completes or overall status shifts',
    icon: Building2,
    push: false,
    inApp: true,
    email: true,
    timing: 'immediate',
    timingOptions: [
      { value: 'immediate', label: 'Immediate on status shift' },
      { value: 'daily_digest', label: 'Batch in Daily Velocity Digest' },
    ],
    badge: 'Milestone',
  },
  {
    id: 'team_mentions',
    title: 'Team Mentions & Notes',
    desc: 'Triggered when a teammate @mentions your profile in comments',
    icon: MessageSquare,
    push: true,
    inApp: true,
    email: false,
    timing: 'immediate',
    timingOptions: [{ value: 'immediate', label: 'Immediately on mention' }],
    badge: 'Discussion',
  },
];

function NotificationsTab({ toast }) {
  // Matrix rules state
  const [rules, setRules] = useState(DEFAULT_NOTIFICATION_RULES);
  // Quiet hours and global controls
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    allowCriticalEscalations: true,
    soundAlerts: true,
  });
  // General switches
  const [generalPrefs, setGeneralPrefs] = useState({
    masterPush: true,
    inAppBanners: true,
    emailDigest: true,
  });

  const [permissionStatus, setPermissionStatus] = useState('default');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // Check browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    // Load saved matrix rules
    try {
      const savedRules = localStorage.getItem('shoolin_push_matrix_v2');
      if (savedRules) {
        const parsed = JSON.parse(savedRules);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRules(parsed);
        }
      }
      const savedQuiet = localStorage.getItem('shoolin_quiet_hours_v2');
      if (savedQuiet) setQuietHours(JSON.parse(savedQuiet));

      const savedGeneral = localStorage.getItem('shoolin_notification_general_v2');
      if (savedGeneral) setGeneralPrefs(JSON.parse(savedGeneral));
    } catch (e) {
      console.error('Failed to load notification matrix settings', e);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Browser push notifications are not supported in this environment.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermissionStatus(result);
      if (result === 'granted') {
        toast.success('Browser push permission granted! Web push alerts are now active.');
      } else if (result === 'denied') {
        toast.error('Push notifications blocked by browser. Please enable them in site settings.');
      }
    } catch (e) {
      toast.error('Error requesting push permission: ' + (e.message || e));
    }
  };

  const handleSendTestPush = () => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      toast.info('Grant browser permission first to preview native OS lockscreen notifications.');
      handleRequestPermission();
      return;
    }

    try {
      new Notification('Shoolin OS • Push Test Alert', {
        body: 'Web Push is active! You will receive instant notifications based on your timing matrix rules.',
        icon: '/favicon.ico',
      });
      toast.success('Test push notification dispatched successfully!');
    } catch {
      toast.success('In-App Notification Test: Delivery channel active and operational!');
    }
  };

  const updateRuleChannel = (id, channel) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [channel]: !r[channel] } : r))
    );
    setDirty(true);
  };

  const updateRuleTiming = (id, newTiming) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, timing: newTiming } : r))
    );
    setDirty(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('shoolin_push_matrix_v2', JSON.stringify(rules));
      localStorage.setItem('shoolin_quiet_hours_v2', JSON.stringify(quietHours));
      localStorage.setItem('shoolin_notification_general_v2', JSON.stringify(generalPrefs));
      setDirty(false);
      toast.success('Notification matrix & delivery timing rules saved successfully!');
    } catch {
      toast.error('Failed to save notification preferences.');
    }
  };

  const handleDiscard = () => {
    try {
      const savedRules = localStorage.getItem('shoolin_push_matrix_v2');
      if (savedRules) setRules(JSON.parse(savedRules));
      else setRules(DEFAULT_NOTIFICATION_RULES);

      const savedQuiet = localStorage.getItem('shoolin_quiet_hours_v2');
      if (savedQuiet) setQuietHours(JSON.parse(savedQuiet));

      const savedGeneral = localStorage.getItem('shoolin_notification_general_v2');
      if (savedGeneral) setGeneralPrefs(JSON.parse(savedGeneral));
    } catch {}
    setDirty(false);
    toast.info('Notification changes reverted.');
  };

  return (
    <div className="space-y-6">
      {/* ── Top Status Card: Web Push Device & Service Worker Status ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-900/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight">Push Notification Engine</h3>
                {permissionStatus === 'granted' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Active & Granted
                  </span>
                ) : permissionStatus === 'denied' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" /> Permission Denied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3 h-3" /> Permission Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Web Push delivers real-time task delegations, deadline warnings, and critical blockers directly to your desktop and mobile PWA lockscreen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {permissionStatus !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Enable Browser Push
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSendTestPush}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Test Alert
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Section: Delivery & Timing Matrix ── */}
      <SectionCard
        title="Push Notification Trigger & Timing Rules Matrix"
        description="Configure exactly which operational triggers fire notifications, their delivery channels, and schedule timing"
        icon={Bell}
        isDirty={dirty}
        onSave={handleSave}
        onReset={handleDiscard}
        saveLabel="Save Notification Matrix"
        showFooterSave={true}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rules.map((rule) => {
            const Icon = rule.icon || Bell;
            return (
              <div key={rule.id} className="py-4 first:pt-1 last:pb-1">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex items-start gap-3 max-w-md">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 mt-0.5">
                      <Icon className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{rule.title}</p>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {rule.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{rule.desc}</p>
                    </div>
                  </div>

                  {/* Controls: Channels & Timing */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 pl-11 lg:pl-0">
                    {/* Timing Selector */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        When to Push
                      </label>
                      <select
                        value={rule.timing}
                        onChange={(e) => updateRuleTiming(rule.id, e.target.value)}
                        className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                      >
                        {rule.timingOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Channels Multi-Toggle */}
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          Push
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRuleChannel(rule.id, 'push')}
                          title="Toggle Web/Mobile Push"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                            rule.push
                              ? 'bg-brand/10 border-brand text-brand dark:bg-brand/20'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          In-App
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRuleChannel(rule.id, 'inApp')}
                          title="Toggle In-App Banner/Drawer"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                            rule.inApp
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                          Email
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRuleChannel(rule.id, 'email')}
                          title="Toggle Email Alert"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                            rule.email
                              ? 'bg-sky-50 border-sky-400 text-sky-600 dark:bg-sky-950/40 dark:border-sky-600 dark:text-sky-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Quiet Hours & Do-Not-Disturb (DND) Window ── */}
      <SectionCard
        title="Quiet Hours & Notification Windows"
        description="Suppress non-urgent push notifications during resting hours while maintaining critical blocker escalations"
        icon={VolumeX}
        isDirty={dirty}
        onSave={handleSave}
        onReset={handleDiscard}
        saveLabel="Save Schedule Rules"
        showFooterSave={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Enable Daily Quiet Hours</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically silences desktop sound and mobile push during selected window
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={quietHours.enabled}
              onClick={() => {
                setQuietHours((q) => ({ ...q, enabled: !q.enabled }));
                setDirty(true);
              }}
              className={`w-10 h-5 rounded-full transition-colors shrink-0 relative cursor-pointer ${
                quietHours.enabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  quietHours.enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {quietHours.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Quiet Window Start Time
                </label>
                <input
                  type="time"
                  value={quietHours.startTime}
                  onChange={(e) => {
                    setQuietHours((q) => ({ ...q, startTime: e.target.value }));
                    setDirty(true);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Quiet Window End Time
                </label>
                <input
                  type="time"
                  value={quietHours.endTime}
                  onChange={(e) => {
                    setQuietHours((q) => ({ ...q, endTime: e.target.value }));
                    setDirty(true);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Bypass Quiet Hours for Critical Blockers & Overdue Alerts
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      High-severity blockers that halt active sprint operations will still notify you immediately
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={quietHours.allowCriticalEscalations}
                  onClick={() => {
                    setQuietHours((q) => ({ ...q, allowCriticalEscalations: !q.allowCriticalEscalations }));
                    setDirty(true);
                  }}
                  className={`w-9 h-5 rounded-full transition-colors shrink-0 relative cursor-pointer ${
                    quietHours.allowCriticalEscalations ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      quietHours.allowCriticalEscalations ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── 5. Display & Density Tab ─────────────────────────────────────────────────
function DisplayTab({ toast }) {
  const [opts, setOpts] = useState({
    density: 'comfortable',
    sidebarDefault: 'expanded',
    animationsEnabled: true,
    tableRows: '20',
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoolin_display_prefs');
      if (saved) setOpts(JSON.parse(saved));
    } catch {}
  }, []);

  const update = (key, val) => {
    setOpts((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('shoolin_display_prefs', JSON.stringify(opts));
      setDirty(false);
      toast.success('Display and interface preferences saved!');
    } catch {
      toast.error('Failed to save display settings.');
    }
  };

  const handleDiscard = () => {
    try {
      const saved = localStorage.getItem('shoolin_display_prefs');
      if (saved) setOpts(JSON.parse(saved));
    } catch {}
    setDirty(false);
    toast.info('Display settings reverted.');
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="Interface Density & Layout Controls"
        description="Fine-tune table row height, sidebar behavior, and micro-animation acceleration"
        icon={Monitor}
        isDirty={dirty}
        onSave={handleSave}
        onReset={handleDiscard}
        saveLabel="Save Display Controls"
      >
        <div className="space-y-5">
          {/* Density Selector */}
          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Table & Data List Density
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Compact', desc: 'Tight spacing for maximum data rows' },
                { id: 'comfortable', label: 'Comfortable', desc: 'Standard balanced enterprise layout' },
                { id: 'spacious', label: 'Spacious', desc: 'Touch-friendly elevated padding' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => update('density', d.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    opts.density === d.id
                      ? 'border-brand bg-brand-subtle text-brand ring-1 ring-brand/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand/40'
                  }`}
                >
                  <p className="text-xs font-bold capitalize">{d.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Default State */}
          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Sidebar Default State on Startup
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'expanded', label: 'Expanded (260px)', desc: 'Always show full navigation titles' },
                { id: 'collapsed', label: 'Icon Rail (Collapsed)', desc: 'Slim icon rail for full-width focus' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => update('sidebarDefault', s.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    opts.sidebarDefault === s.id
                      ? 'border-brand bg-brand-subtle text-brand ring-1 ring-brand/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand/40'
                  }`}
                >
                  <p className="text-xs font-bold">{s.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Table Rows Pagination */}
          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Default Rows Per Table Page
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['10', '25', '50', '100'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => update('tableRows', r)}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                    opts.tableRows === r
                      ? 'border-brand bg-brand-subtle text-brand'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand/40'
                  }`}
                >
                  {r} Rows
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Animations Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Smooth Micro-Animations & Page Transitions
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                GPU-accelerated modal transforms, drawer slides, and button ripple effects
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={opts.animationsEnabled}
              onClick={() => update('animationsEnabled', !opts.animationsEnabled)}
              className={`w-10 h-5 rounded-full transition-colors shrink-0 relative cursor-pointer ${
                opts.animationsEnabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  opts.animationsEnabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── 6. Security & Data Management Tab ────────────────────────────────────────
function SecurityTab({ toast }) {
  const { projects, tasks, users } = useAppContext();

  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        organization: 'Shoolin Innovations Limited',
        projectsCount: projects?.length || 0,
        tasksCount: tasks?.length || 0,
        usersCount: users?.length || 0,
        data: { projects, tasks, users },
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shoolin-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Complete workspace dataset exported to JSON!');
    } catch {
      toast.error('Failed to export dataset.');
    }
  };

  const handleResetWorkspace = () => {
    if (window.confirm('Are you sure you want to reset local storage caches to factory defaults?')) {
      try {
        localStorage.removeItem('shoolin_workspace_settings');
        localStorage.removeItem('shoolin_notification_prefs');
        localStorage.removeItem('shoolin_display_prefs');
        toast.success('Workspace caches cleared. Refreshing in 1 second...');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error('Unable to reset storage.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="Enterprise Security & Session Safeguards"
        description="Session duration, authentication policies, and cryptographic security audits"
        icon={ShieldCheck}
        showFooterSave={false}
      >
        <div className="space-y-3">
          {[
            {
              title: 'Multi-Factor Authentication (MFA)',
              status: 'Configured & Active',
              badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
              desc: 'Enforced for all Super Admin and Department Lead roles across tenant',
            },
            {
              title: 'Inactivity Session Lockout',
              status: '30 Minutes',
              badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
              desc: 'Automatically locks workstation view and requires biometric or PIN reentry',
            },
            {
              title: 'Role-Based Bitwise Access Audits',
              status: 'Realtime Logging',
              badgeColor: 'bg-brand-light text-brand-text',
              desc: 'Tit-to-bit authorization matrix tracks every project mutation and permission override',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${item.badgeColor}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Data Backup & Workspace Maintenance"
        description="Export encrypted system snapshots or restore factory defaults"
        icon={Download}
        showFooterSave={false}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Full Workspace Data</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Download all active projects, tasks, user rosters, and settings as a portable JSON package
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              Export JSON
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/60">
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-200">Reset Local Caches & Factory Defaults</p>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400 mt-0.5">
                Clear customized theme overrides and restored default tenant configuration
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetWorkspace}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shadow-2xs shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Caches
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main Settings Page Component ─────────────────────────────────────────────
export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useUrlTab('tab', 'appearance', [
    'appearance',
    'profile',
    'workspace',
    'notifications',
    'display',
    'security'
  ]);

  const currentTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];

  const renderTab = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearanceTab toast={toast} />;
      case 'profile':
        return <ProfileTab toast={toast} />;
      case 'workspace':
        return <WorkspaceTab toast={toast} />;
      case 'notifications':
        return <NotificationsTab toast={toast} />;
      case 'display':
        return <DisplayTab toast={toast} />;
      case 'security':
        return <SecurityTab toast={toast} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* ─── Page Top Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-light/40 dark:bg-brand/15 flex items-center justify-center">
              <Settings className="w-4 h-4 text-brand" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-10.5">
            Manage your workspace configuration, security safeguards, interface appearance, and account preferences.
          </p>
        </div>

        {/* Global Tab Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <currentTabMeta.icon className="w-3.5 h-3.5 text-brand" />
          <span>Section: {currentTabMeta.label}</span>
        </div>
      </div>

      {/* ─── Mobile Horizontal Scrollable Tab Bar ───────────── */}
      <div className="md:hidden w-full overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                  active
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Two-Column Layout ───────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sticky Sidebar Nav */}
        <aside className="w-60 shrink-0 hidden md:block sticky top-20">
          <nav className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all group ${
                    idx < TABS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/80' : ''
                  } ${
                    active
                      ? 'bg-brand-subtle text-brand font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        active
                          ? 'bg-brand text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs truncate ${active ? 'text-brand font-bold' : ''}`}>
                        {tab.label}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-brand shrink-0" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Tab Content Area */}
        <div className="flex-1 min-w-0 w-full">{renderTab()}</div>
      </div>
    </div>
  );
}
