'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Layers,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  CornerDownRight,
  FolderTree,
  Sparkles,
  Info,
  Pencil,
  Check,
  Tag
} from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProvider';
import { countTreeNodes, getMaxTreeDepth, DEFAULT_BLUEPRINT_CATEGORIES } from '@/data/templates';

// Helper: generate a unique node ID
const generateNodeId = () => `node-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

export const RECURRING_DAY_OPTIONS = [
  '1st of every month',
  '2nd of every month',
  '3rd of every month',
  '4th of every month',
  '5th of every month',
  '6th of every month',
  '7th of every month',
  '8th of every month',
  '9th of every month',
  '10th of every month',
  '11th of every month',
  '12th of every month',
  '13th of every month',
  '14th of every month',
  '15th of every month',
  '16th of every month',
  '17th of every month',
  '18th of every month',
  '19th of every month',
  '20th of every month',
  '21st of every month',
  '22nd of every month',
  '23rd of every month',
  '24th of every month',
  '25th of every month',
  '26th of every month',
  '27th of every month',
  '28th of every month',
  '29th of every month',
  '30th of every month',
  'Last day of every month'
];

// Recursive Node Component
function TreeNodeItem({
  node,
  path = [],
  depth = 1,
  onAddSubtask,
  onUpdateTitle,
  onDeleteNode
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const currentPath = [...path, node.title];

  const handleAddChild = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(node.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    setIsExpanded(true);
  };

  // Color-coded depth indicator
  const depthLabels = {
    1: 'Task',
    2: 'Sub-task',
    3: 'Sub-task (L3)',
    4: 'Sub-task (L4)',
    5: 'Sub-task (L5)',
    6: 'Sub-task (L6)',
    7: 'Sub-task (L7)'
  };

  const depthBadgeColors = {
    1: 'bg-brand-light/30 text-brand border-brand/30',
    2: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    3: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    4: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    5: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    6: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  const badgeStyle = depthBadgeColors[depth] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-md hover:border-slate-300 dark:hover:border-slate-700 group transition-colors">
        {/* Expand / Collapse icon if has children */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-sm"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="w-3.5 flex justify-center text-slate-300 dark:text-slate-600">
            <CornerDownRight className="w-3 h-3" />
          </div>
        )}

        {/* Level Tag */}
        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm border whitespace-nowrap ${badgeStyle}`}>
          {depthLabels[depth] || `Sub-task (L${depth})`}
        </span>

        {/* Inline editable title input */}
        <input
          type="text"
          value={node.title}
          onChange={(e) => onUpdateTitle(node.id, e.target.value)}
          className="flex-1 px-2 py-1 bg-transparent border-b border-transparent focus:border-brand text-slate-900 dark:text-slate-100 font-medium focus:bg-slate-50 dark:focus:bg-slate-800 rounded-sm focus:outline-none"
          placeholder="Enter task title..."
        />

        {/* Action: Add Nested Sub-task button */}
        <button
          type="button"
          onClick={() => setIsAddingSubtask(!isAddingSubtask)}
          title={`Add sub-task under this item (Level ${depth + 1})`}
          className="px-2 py-1 text-[11px] font-semibold text-brand bg-brand-light/30 hover:bg-brand-light/50 border border-brand/30 rounded-sm flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>+ Sub-task</span>
        </button>

        {/* Action: Delete Node */}
        <button
          type="button"
          onClick={() => onDeleteNode(node.id)}
          title="Delete this task and all nested sub-tasks"
          className="p-1 text-slate-400 hover:text-rose-500 rounded-sm transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtask Quick Input Form */}
      {isAddingSubtask && (
        <form onSubmit={handleAddChild} className="ml-5 flex items-center gap-2 p-1.5 bg-brand-light/10 border border-brand/20 rounded-md">
          <CornerDownRight className="w-3.5 h-3.5 text-brand ml-1" />
          <input
            type="text"
            autoFocus
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder={`Enter nested sub-task title (Level ${depth + 1})...`}
            className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-brand hover:bg-brand-hover text-white font-semibold rounded-sm text-xs"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingSubtask(false);
              setNewSubtaskTitle('');
            }}
            className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Nested Children (Recursive rendering with indent line) */}
      {hasChildren && isExpanded && (
        <div className="pl-4 ml-2 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5">
          {node.children.map((childNode) => (
            <TreeNodeItem
              key={childNode.id}
              node={childNode}
              path={currentPath}
              depth={depth + 1}
              onAddSubtask={onAddSubtask}
              onUpdateTitle={onUpdateTitle}
              onDeleteNode={onDeleteNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onAddTemplate,
  onUpdateTemplate,
  templateToEdit
}) {
  const {
    blueprintCategories,
    editingTemplate,
    handleUpdateTemplate: ctxUpdateTemplate,
    handleAddTemplate: ctxAddTemplate
  } = useAppContext();

  const currentTemplate = templateToEdit || editingTemplate;
  const isEditMode = Boolean(currentTemplate);

  const [name, setName] = useState('');
  const [type, setType] = useState('one-time');
  const [category, setCategory] = useState('Website Development');
  const [recurringDay, setRecurringDay] = useState('1st of every month');
  const [description, setDescription] = useState('');

  // Recursive Tree State: array of Level 1 root tasks
  const [tasksTree, setTasksTree] = useState([]);
  const [newRootTitle, setNewRootTitle] = useState('');
  const [error, setError] = useState('');

  // Populate or reset state on open/mode switch
  useEffect(() => {
    if (!isOpen) return;

    if (currentTemplate) {
      setName(currentTemplate.name || '');
      setType(currentTemplate.type || 'one-time');
      const initialCat = categoryOptions.includes(currentTemplate.category)
        ? currentTemplate.category
        : (categoryOptions[0] || 'Website Development');
      setCategory(initialCat);
      setRecurringDay(currentTemplate.recurringDay || currentTemplate.defaultDuration || '1st of every month');
      setDescription(currentTemplate.description || '');

      // Load tasks tree or build from preview fallback
      if (currentTemplate.tasksTree && currentTemplate.tasksTree.length > 0) {
        setTasksTree(JSON.parse(JSON.stringify(currentTemplate.tasksTree)));
      } else if (currentTemplate.tasksPreview && currentTemplate.tasksPreview.length > 0) {
        setTasksTree(
          currentTemplate.tasksPreview.map((item) => ({
            id: generateNodeId(),
            title: item,
            children: []
          }))
        );
      } else {
        setTasksTree([]);
      }
    } else {
      // Defaults for brand new template
      setName('');
      setType('one-time');
      const firstCat = blueprintCategories?.[0]?.name || 'Website Development';
      setCategory(firstCat);
      setRecurringDay('1st of every month');
      setDescription('');
      setTasksTree([
        {
          id: generateNodeId(),
          title: 'Discovery & System Architecture',
          children: [
            {
              id: generateNodeId(),
              title: 'Technical Stakeholder Alignment',
              children: [
                {
                  id: generateNodeId(),
                  title: 'Security & SSO Mapping Specs',
                  children: [
                    {
                      id: generateNodeId(),
                      title: 'OAuth2 / SAML Token Rotation Strategy',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              id: generateNodeId(),
              title: 'Database ERD & Indexing Plan',
              children: []
            }
          ]
        },
        {
          id: generateNodeId(),
          title: 'Frontend Component Engineering',
          children: [
            {
              id: generateNodeId(),
              title: 'Design Tokens & Theme Switcher Setup',
              children: []
            }
          ]
        },
        {
          id: generateNodeId(),
          title: 'Production Cutover & QA Audit',
          children: []
        }
      ]);
    }

    setError('');
    setNewRootTitle('');
  }, [isOpen, currentTemplate, blueprintCategories]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Derived category list strictly from Blueprint Master
  const categoryOptions = useMemo(() => {
    const list = [];
    const source = (blueprintCategories && blueprintCategories.length > 0)
      ? blueprintCategories
      : DEFAULT_BLUEPRINT_CATEGORIES;

    (source || []).forEach((c) => {
      const name = typeof c === 'string' ? c : (c.name || c.title || '');
      const status = typeof c === 'object' && c.status ? c.status : 'Active';
      if (name && status === 'Active') {
        list.push(name);
      }
    });

    return Array.from(new Set(list));
  }, [blueprintCategories]);

  if (!isOpen) return null;

  // Add a top-level root task
  const handleAddRootTask = (e) => {
    if (e) e.preventDefault();
    if (!newRootTitle.trim()) return;
    const newTask = {
      id: generateNodeId(),
      title: newRootTitle.trim(),
      children: []
    };
    setTasksTree([...tasksTree, newTask]);
    setNewRootTitle('');
  };

  // Recursively add a subtask under a target parent node ID
  const handleAddSubtask = (parentId, childTitle) => {
    const addChildRecursively = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          const newChild = {
            id: generateNodeId(),
            title: childTitle,
            children: []
          };
          return {
            ...node,
            children: [...(node.children || []), newChild]
          };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: addChildRecursively(node.children)
          };
        }
        return node;
      });
    };

    setTasksTree(addChildRecursively(tasksTree));
  };

  // Recursively update a node's title
  const handleUpdateTitle = (nodeId, newTitle) => {
    const updateRecursively = (nodes) => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, title: newTitle };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateRecursively(node.children)
          };
        }
        return node;
      });
    };

    setTasksTree(updateRecursively(tasksTree));
  };

  // Recursively delete a node
  const handleDeleteNode = (nodeId) => {
    const deleteRecursively = (nodes) => {
      return nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => {
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: deleteRecursively(node.children)
            };
          }
          return node;
        });
    };

    setTasksTree(deleteRecursively(tasksTree));
  };

  const totalNodesCount = countTreeNodes(tasksTree);
  const maxTreeDepth = getMaxTreeDepth(tasksTree);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a template name.');
      return;
    }
    if (tasksTree.length === 0) {
      setError('Please add at least 1 task to this template.');
      return;
    }

    const finalCategory = category || categoryOptions[0] || 'Website Development';

    // Generate preview summary strings for card displays
    const generatePreviewLines = (nodes, prefix = '') => {
      const lines = [];
      nodes.forEach((node) => {
        const titleWithPrefix = prefix ? `${prefix} > ${node.title}` : node.title;
        lines.push(titleWithPrefix);
        if (node.children && node.children.length > 0) {
          lines.push(...generatePreviewLines(node.children, titleWithPrefix));
        }
      });
      return lines;
    };

    const previewList = generatePreviewLines(tasksTree).slice(0, 8);

    if (isEditMode && currentTemplate) {
      const updatedTemplate = {
        ...currentTemplate,
        name: name.trim(),
        type,
        category: finalCategory,
        tasksCount: totalNodesCount,
        maxDepth: maxTreeDepth,
        recurringDay: type === 'recurring' ? recurringDay : null,
        defaultDuration: type === 'recurring' ? recurringDay : null,
        lastUpdated: new Date().toISOString().split('T')[0],
        description: description.trim() || `Configured ${finalCategory} template with ${totalNodesCount} hierarchical tasks up to ${maxTreeDepth} levels deep.`,
        tasksTree: tasksTree,
        tasksPreview: previewList
      };

      if (onUpdateTemplate) {
        onUpdateTemplate(updatedTemplate);
      } else if (ctxUpdateTemplate) {
        ctxUpdateTemplate(updatedTemplate);
      }
    } else {
      const newTemplate = {
        id: `tmpl-custom-${Date.now()}`,
        name: name.trim(),
        type,
        category: finalCategory,
        tasksCount: totalNodesCount,
        maxDepth: maxTreeDepth,
        recurringDay: type === 'recurring' ? recurringDay : null,
        defaultDuration: type === 'recurring' ? recurringDay : null,
        createdBy: 'Current User',
        lastUpdated: new Date().toISOString().split('T')[0],
        isCustom: true,
        description: description.trim() || `Configured ${finalCategory} template with ${totalNodesCount} hierarchical tasks up to ${maxTreeDepth} levels deep.`,
        tasksTree: tasksTree,
        tasksPreview: previewList
      };

      if (onAddTemplate) {
        onAddTemplate(newTemplate);
      } else if (ctxAddTemplate) {
        ctxAddTemplate(newTemplate);
      }
    }

    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-md shadow-xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Header - Clean, No gradient, No top border */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md bg-brand text-white flex items-center justify-center shadow-sm shrink-0`}>
              {isEditMode ? <Pencil className="w-4 h-4" /> : <FolderTree className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {isEditMode ? 'Edit Project Template' : 'Create Project Template'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-sm bg-brand-light/30 text-brand border border-brand/30">
                  {isEditMode ? `Editing: ${currentTemplate.name}` : 'N-Level Task Tree'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {isEditMode
                  ? 'Update template details, timeline, deliverables, category master association, and hierarchical tasks'
                  : 'Build nested task > sub-task > sub-task structures to any required depth'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-md flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Template Name & Type */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Template Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Enterprise E-Commerce SaaS Sprint, AI Agent Integration..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:border-brand text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
                required
              />
            </div>

            {/* Delivery Model (Single Color Buttons) */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Project Delivery Model
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setType('one-time');
                    if (defaultDuration.includes('Monthly')) setDefaultDuration('60 Days');
                  }}
                  className={`p-3 rounded-md border text-left flex items-start gap-2.5 transition-colors ${type === 'one-time'
                    ? 'border-brand bg-brand-light/20 dark:bg-brand-light/10 text-brand font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${type === 'one-time' ? 'border-brand bg-brand' : 'border-slate-400'}`}>
                    {type === 'one-time' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold block text-xs">One-Time Project Template</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Standard sprint with start and target cutover dates
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('recurring');
                    setDefaultDuration('Monthly (30 Days)');
                  }}
                  className={`p-3 rounded-md border text-left flex items-start gap-2.5 transition-colors ${type === 'recurring'
                    ? 'border-brand bg-brand-light/20 dark:bg-brand-light/10 text-brand font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${type === 'recurring' ? 'border-brand bg-brand' : 'border-slate-400'}`}>
                    {type === 'recurring' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold block text-xs">Recurring Monthly Retainer</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      Cyclic tasks regenerated each month on scheduled billing day
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Category (Connected to Master) & Recurring Auto Re-Add Date (Only for Recurring) */}
          <div className={`grid grid-cols-1 ${type === 'recurring' ? 'sm:grid-cols-2' : ''} gap-3`}>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand" />
                <span>Category (Master) <span className="text-rose-500">*</span></span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-medium focus:border-brand focus:outline-none"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {type === 'recurring' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Auto Re-Add Date (Monthly) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-medium focus:border-brand focus:outline-none"
                >
                  {RECURRING_DAY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Date of month on which tasks are automatically re-added.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Description &amp; Objective
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Outline the operational scope and intended outcomes..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-brand focus:outline-none"
            />
          </div>

          {/* HIERARCHICAL TASK & SUB-TASK TREE BUILDER (EDIT AREA) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-brand" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Hierarchical Task &amp; Sub-task Breakdown
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Click <strong className="text-brand">+ Sub-task</strong> on any item to nest children (task &gt; sub-task &gt; sub-task...)
                </p>
              </div>

              {/* Counter badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm text-slate-800 dark:text-slate-200">
                  {totalNodesCount} Total Deliverables
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-brand-light/30 text-brand border border-brand/30 rounded-sm">
                  {maxTreeDepth} Levels Deep
                </span>
              </div>
            </div>

            {/* Add Top-Level Task Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRootTitle}
                onChange={(e) => setNewRootTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRootTask();
                  }
                }}
                placeholder="Type a new top-level task and press Enter or click Add Root Task..."
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddRootTask}
                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold rounded-sm flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Root Task</span>
              </button>
            </div>

            {/* Tree Items Container */}
            <div className="space-y-2 mt-2 max-h-72 overflow-y-auto pr-1">
              {tasksTree.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-md">
                  No tasks added yet. Type above to add your first root task.
                </div>
              ) : (
                tasksTree.map((rootNode) => (
                  <TreeNodeItem
                    key={rootNode.id}
                    node={rootNode}
                    path={[]}
                    depth={1}
                    onAddSubtask={handleAddSubtask}
                    onUpdateTitle={handleUpdateTitle}
                    onDeleteNode={handleDeleteNode}
                  />
                ))
              )}
            </div>
          </div>
        </form>

        {/* Footer - Clean single color button, no gradients */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:bg-brand-hover rounded-md shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
