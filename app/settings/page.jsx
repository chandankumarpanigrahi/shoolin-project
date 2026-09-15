'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/components/providers/AppProvider';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Camera, Sun, Moon, Check, Building2, UserCheck, Palette, Sparkles, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const {
    currentUser,
    setIsAuthOpen,
    theme,
    toggleTheme,
    setIsChangeDpOpen,
    brandColor,
    changeBrandColor,
    BRAND_COLOR_PRESETS
  } = useAppContext();

  const [customHex, setCustomHex] = useState('#4f46e5');

  const handleCustomHexSubmit = (e) => {
    e.preventDefault();
    if (/^#[0-9A-F]{6}$/i.test(customHex)) {
      changeBrandColor(customHex);
    } else {
      alert('Please enter a valid 6-digit hex color (e.g. #2563EB)');
    }
  };

  return (
    <div className="space-y-6 text-xs pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-light/30 text-brand flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Workspace &amp; User Preferences
            </h1>
            <span className="text-xs px-2 py-0.5 bg-brand-light/30 text-brand font-mono font-bold rounded-full border border-brand/30">
              System Branding &amp; Themes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize global brand color architecture, appearance theme, user Display Picture (DP), and active identity preferences.
          </p>
        </div>
      </div>

      {/* 1. Global Brand Color Architecture Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 gap-2">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand" />
              <span>Global Brand Color Architecture</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Change the brand primary color once to instantly re-theme all buttons, nav highlights, active states, and UI accents across the entire web application
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-brand-light text-brand-text font-bold border border-brand-border self-start sm:self-auto shadow-2xs">
            Active Hex: {brandColor.toUpperCase()}
          </span>
        </div>

        {/* Brand Presets */}
        <div className="space-y-2.5">
          <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
            1-Click Preset Brand Swatches
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {BRAND_COLOR_PRESETS.map((preset) => {
              const isSelected = brandColor === preset.id || brandColor.toLowerCase() === preset.primary.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => changeBrandColor(preset.id)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 group relative overflow-hidden ${
                    isSelected
                      ? 'border-brand ring-2 ring-brand/40 bg-brand-light/20 shadow-md scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-brand/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="w-7 h-7 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.primary }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-brand text-white font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {preset.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {preset.primary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Color Picker */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleCustomHexSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                Custom Brand Hex Color Picker
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#4F46E5"
                  className="w-36 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Apply Custom Color
                </button>
              </div>
            </div>
            <div className="p-3 bg-brand-subtle rounded-xl border border-brand-border text-[11px] text-brand-text shrink-0">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> CSS Variable &amp; Class Based
              </span>
              Updates <code className="font-mono bg-white/60 dark:bg-black/30 px-1 rounded">--brand-primary</code> and all <code className="font-mono bg-white/60 dark:bg-black/30 px-1 rounded">bg-brand</code> classes live!
            </div>
          </form>
        </div>
      </div>

      {/* 2. Appearance / Theme Switcher (1-Click) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Theme Mode (1-Click Switch)</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Instantly toggle between high-contrast Dark Mode and crisp Light Mode
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
            Active: {theme.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Light Option */}
          <div
            onClick={() => {
              if (theme !== 'light') toggleTheme();
            }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'border-brand bg-brand-subtle shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Light Mode</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Clean, high-visibility paper aesthetic</p>
              </div>
            </div>
            {theme === 'light' && (
              <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Dark Option */}
          <div
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'border-brand bg-brand-subtle shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-800 text-brand border border-slate-700">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Dark Mode</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Deep slate high-contrast dark theme</p>
              </div>
            </div>
            {theme === 'dark' && (
              <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Display Picture (DP) & Profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand" />
            <span>Display Picture (DP) &amp; Profile</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
            Your display picture is visible to all collaborators in task assignments, avatar stacks, and meeting rosters
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
          <div className="flex items-center gap-4">
            <div
              className="relative group cursor-pointer rounded-full"
              style={{ borderRadius: '50%' }}
              onClick={() => setIsChangeDpOpen(true)}
            >
              <UserAvatar user={currentUser} size="xl" />
              <div
                style={{ borderRadius: '50%' }}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {currentUser.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {currentUser.email}
              </p>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-text">
                {currentUser.role} · {currentUser.department}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChangeDpOpen(true)}
              className="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change DP</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch User</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Workspace Parameters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Organization Parameters</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
            Default configurations for task codes and tenant routing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Organization Tenant Name
            </label>
            <input
              type="text"
              defaultValue="PMV Global Group"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand shadow-2xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Task Code Prefix
            </label>
            <input
              type="text"
              defaultValue="PMV"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-brand shadow-2xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

