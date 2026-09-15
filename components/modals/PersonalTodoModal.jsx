'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  FolderGit2,
  Calendar,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { PriorityBadge, StatusBadge } from '@/components/common/Badges';
import Link from 'next/link';

const CATEGORY_STYLES = {
  Focus: {
    label: 'Focus',
    badge: 'bg-brand-light/30 text-brand border-brand/30',
    buttonActive: 'bg-brand text-white shadow-sm ring-2 ring-brand/40 font-bold',
    dot: 'bg-brand'
  },
  'Quick Win': {
    label: 'Quick Win',
    badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    buttonActive: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40 font-bold',
    dot: 'bg-emerald-500'
  },
  'Follow-up': {
    label: 'Follow-up',
    badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    buttonActive: 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40 font-bold',
    dot: 'bg-amber-500'
  },
  Prep: {
    label: 'Prep',
    badge: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    buttonActive: 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/40 font-bold',
    dot: 'bg-sky-500'
  },
  Review: {
    label: 'Review',
    badge: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    buttonActive: 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40 font-bold',
    dot: 'bg-purple-500'
  }
};

const CATEGORIES = ['Focus', 'Quick Win', 'Follow-up', 'Prep', 'Review'];

export function PersonalTodoModal({ isOpen, onClose }) {
  const {
    currentUser,
    personalTodos,
    addPersonalTodo,
    togglePersonalTodo,
    deletePersonalTodo,
    tasks,
    projects
  } = useAppContext();

  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Focus');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'assigned'

  // Animate in when opening, animate out when closing
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isRendered) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    addPersonalTodo(newTodoText.trim(), selectedCategory);
    setNewTodoText('');
  };

  const filteredTodos = personalTodos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const pendingCount = personalTodos.filter((t) => !t.completed).length;

  // Project tasks assigned to current user
  const assignedTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:w-[480px] md:w-[540px] max-w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-xs text-slate-900 dark:text-slate-100 flex flex-col rounded-l-md transform transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white shadow-sm font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Personal To-Do &amp; Focus
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-brand-light/30 text-brand font-bold rounded-full border border-brand/30">
                    {pendingCount} active
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Private scratchpad &amp; deliverable focus for {currentUser?.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                activeTab === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              My Checklist ({personalTodos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                activeTab === 'assigned'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Assigned Tasks ({assignedTasks.length})
            </button>
          </div>

          {activeTab === 'todos' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
                  filter === 'all'
                    ? 'text-brand font-bold bg-brand-light/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
                  filter === 'pending'
                    ? 'text-brand font-bold bg-brand-light/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors ${
                  filter === 'completed'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Personal Checklist */}
        {activeTab === 'todos' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quick Add Bar */}
            <form onSubmit={handleAdd} className="space-y-2.5 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-md border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Type personal to-do and press Enter..."
                  className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 shadow-2xs"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newTodoText.trim()}
                  className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Category selector pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">Tag:</span>
                {CATEGORIES.map((cat) => {
                  const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.Focus;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? style.buttonActive
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : style.dot}`} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </form>

            {/* Todo List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/90 shadow-sm">
              {filteredTodos.length === 0 ? (
                <div className="p-10 text-center text-slate-400 dark:text-slate-500">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-light/30 flex items-center justify-center text-brand">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No to-dos in this list</p>
                  <p className="text-[11px] mt-1 text-slate-400">Type above and hit Add to create your private checklist</p>
                </div>
              ) : (
                filteredTodos.map((todo) => {
                  const style = CATEGORY_STYLES[todo.category] || CATEGORY_STYLES.Focus;
                  return (
                    <div
                      key={todo.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                        onClick={() => togglePersonalTodo(todo.id)}
                      >
                        <button
                          type="button"
                          className="text-slate-400 hover:text-brand transition-colors shrink-0"
                        >
                          {todo.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-brand transition-colors" />
                          )}
                        </button>
                        <span
                          className={`text-xs truncate ${
                            todo.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100 font-medium'
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {todo.category && (
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${style.badge}`}>
                            {todo.category}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deletePersonalTodo(todo.id)}
                          className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete to-do"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Assigned Project Deliverables */}
        {activeTab === 'assigned' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-2">
              Deliverables from active projects officially assigned to you:
            </p>
            {assignedTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No active project tasks currently assigned to you.
              </div>
            ) : (
              assignedTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <div
                    key={t.id}
                    className="p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:border-brand transition-all shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-brand bg-brand-light/30 border border-brand/30 px-2 py-0.5 rounded-md">
                          {t.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                          {project?.name}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due {t.targetDate || t.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge status={t.status} size="xs" />
                      <PriorityBadge priority={t.priority} size="xs" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <Link
            href="/tasks"
            onClick={handleClose}
            className="text-xs text-brand hover:underline font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Open All Project Tasks</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
