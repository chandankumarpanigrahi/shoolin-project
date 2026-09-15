'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  FolderTree,
  CornerDownRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { ProjectTypeBadge } from '@/components/common/Badges';
import { countTreeNodes, getMaxTreeDepth } from '@/data/templates';

// Recursive card tree item component
function CardTreeItem({ node, depth = 1 }) {
  const [isExpanded, setIsExpanded] = useState(depth <= 2);
  const hasChildren = node.children && node.children.length > 0;

  const depthBadges = {
    1: 'Task',
    2: 'Sub-task',
    3: 'Sub-task (L3)',
    4: 'Sub-task (L4)',
    5: 'Sub-task (L5)',
    6: 'Sub-task (L6)'
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <CornerDownRight className="w-3 h-3 text-slate-300 dark:text-slate-600 ml-0.5 shrink-0" />
        )}
        <span className="text-[10px] px-1 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-semibold shrink-0">
          {depthBadges[depth] || `L${depth}`}
        </span>
        <span className="font-medium truncate">{node.title}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-3.5 ml-1.5 border-l border-slate-200 dark:border-slate-800 space-y-1">
          {node.children.map((childNode, idx) => (
            <CardTreeItem key={childNode.id || idx} node={childNode} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TemplatesView({ onSelectTemplateForCreation }) {
  const {
    templates,
    setIsCreateTemplateOpen,
    handleDeleteTemplate
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all categories dynamically
  const categories = useMemo(() => {
    const set = new Set();
    templates.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesCategory = t.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }
      return true;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleDelete = (e, tmpl) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove template "${tmpl.name}"?`)) {
      handleDeleteTemplate(tmpl.id);
    }
  };

  return (
    <div className="space-y-4 pb-14 text-xs">
      {/* Top Banner / Header - Clean, No gradients, No top border, max rounded-md */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-brand text-white flex items-center justify-center shadow-sm shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Project Architecture Blueprints
                </h1>
                <span className="text-xs px-2 py-0.5 bg-brand-subtle text-brand-text font-semibold rounded-sm border border-brand-border">
                  {templates.length} templates
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Standard sprint templates with multi-level hierarchical tasks (task &gt; sub-task &gt; sub-task...)
              </p>
            </div>
          </div>

          {/* Single-color solid button, rounded-md */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateTemplateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-hover rounded-md shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Blueprint Template</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Categories & Search */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-sm font-semibold transition-colors whitespace-nowrap text-xs ${
                  selectedCategory === c
                    ? 'bg-white dark:bg-slate-900 text-brand shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {c === 'ALL' ? 'All Blueprints' : c}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blueprints..."
              className="w-full pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Blueprints Grid - No top borders, rounded-md, clean single-color buttons */}
      {filteredTemplates.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md space-y-3">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500">No blueprints found matching your filter.</p>
          <button
            type="button"
            onClick={() => setIsCreateTemplateOpen(true)}
            className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-md text-xs"
          >
            Create Blueprint Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((t) => {
            const tree = t.tasksTree || [];
            const totalTasks = tree.length > 0 ? countTreeNodes(tree) : (t.tasksCount || t.tasksPreview?.length || 12);
            const maxDepth = tree.length > 0 ? getMaxTreeDepth(tree) : 1;

            return (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  {/* Card Header: Type, Category, Tasks Count & Delete (NO top border strip) */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <ProjectTypeBadge type={t.type} size="xs" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700">
                        {t.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700">
                        {totalTasks} Deliverables
                      </span>

                      {maxDepth > 1 && (
                        <span className="text-[10px] font-mono text-brand-text bg-brand-subtle px-1.5 py-0.5 rounded-sm border border-brand-border font-bold">
                          {maxDepth} Levels
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, t)}
                        title="Delete Blueprint"
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {t.name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  {/* Hierarchical Task & Sub-task Breakdown Box */}
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <FolderTree className="w-3.5 h-3.5 text-brand" />
                        Task &gt; Sub-task Hierarchy
                      </span>
                      <span className="text-brand font-mono font-normal">
                        {tree.length} Root Tracks
                      </span>
                    </div>

                    {/* Render tree or fallback preview */}
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {tree.length > 0 ? (
                        tree.map((node, idx) => (
                          <CardTreeItem key={node.id || idx} node={node} depth={1} />
                        ))
                      ) : (
                        t.tasksPreview?.map((previewItem, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs py-0.5">
                            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{previewItem}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer - Single color button, rounded-md, no gradients */}
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{t.defaultDuration || '60 Days'}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectTemplateForCreation(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-hover rounded-md shadow-sm transition-colors"
                  >
                    <span>Instantiate Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
