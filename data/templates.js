// Project Templates dataset - Clean Slate Dynamic Initial State
// Supports unlimited depth nesting: Task > Sub-task > Sub-task > Sub-task...

export function countTreeNodes(tree) {
  if (!tree || !Array.isArray(tree)) return 0;
  let count = 0;
  function traverse(nodes) {
    for (const node of nodes) {
      count++;
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(tree);
  return count;
}

export function getMaxTreeDepth(tree) {
  if (!tree || !Array.isArray(tree) || tree.length === 0) return 0;
  function getDepth(node) {
    if (!node.children || node.children.length === 0) return 1;
    let maxChild = 0;
    for (const child of node.children) {
      const d = getDepth(child);
      if (d > maxChild) maxChild = d;
    }
    return 1 + maxChild;
  }
  let max = 0;
  for (const node of tree) {
    const d = getDepth(node);
    if (d > max) max = d;
  }
  return max;
}

export function flattenTreeToTasks(tree, projectId, projectCode) {
  const result = [];
  function traverse(nodes, parentId = null, codePrefix = projectCode, level = 1) {
    nodes.forEach((node, index) => {
      const taskId = `task-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const taskCode = `${codePrefix}.${index + 1}`;
      const taskObj = {
        id: taskId,
        projectId: projectId,
        code: taskCode,
        title: node.title,
        parentId: parentId,
        level: level,
        status: 'Not Started',
        priority: node.priority || 'Medium',
        progress: 0,
        assigneeId: null,
        startDate: '2026-09-15',
        dueDate: '2026-10-30',
        weight: 1,
        description: node.description || `Task generated from template: ${node.title}`,
        dependencies: [],
        subtasks: []
      };
      result.push(taskObj);
      if (node.children && node.children.length > 0) {
        traverse(node.children, taskId, taskCode, level + 1);
      }
    });
  }
  traverse(tree);
  return result;
}

export const TEMPLATES = [];

export const DEFAULT_BLUEPRINT_CATEGORIES = [
  {
    id: 'bcat-1',
    name: 'Website Development',
    code: 'WEB',
    color: '#2563EB',
    description: 'End-to-end web projects covering UI/UX, engineering, CMS integrations, and launch audits',
    status: 'Active',
    isSystem: true
  },
  {
    id: 'bcat-2',
    name: 'Mobile App Development',
    code: 'APP',
    color: '#9333EA',
    description: 'Cross-platform iOS & Android mobile application design, native hooks, and app store deployment',
    status: 'Active',
    isSystem: true
  },
  {
    id: 'bcat-3',
    name: 'Cloud & Dashboards',
    code: 'CLOUD',
    color: '#059669',
    description: 'Multi-tenant cloud portals, real-time analytics dashboards, and microservice backend architecture',
    status: 'Active',
    isSystem: true
  },
  {
    id: 'bcat-4',
    name: 'UI/UX Design & Branding',
    code: 'DES',
    color: '#D97706',
    description: 'User experience research, wireframing, Figma design tokens & interaction prototyping',
    status: 'Active',
    isSystem: true
  },
  {
    id: 'bcat-5',
    name: 'Social Media Management',
    code: 'SMM',
    color: '#E11D48',
    description: 'Monthly cyclic content calendars, reel production, engagement & community management',
    status: 'Active',
    isSystem: true
  },
  {
    id: 'bcat-6',
    name: 'SEO & Growth',
    code: 'SEO',
    color: '#0891B2',
    description: 'Technical SEO audits, keyword ranking architectures, content expansion & link outreach',
    status: 'Active',
    isSystem: true
  },
  {
    id: 'bcat-7',
    name: 'DevOps & Cloud',
    code: 'DEVOPS',
    color: '#4F46E5',
    description: 'Cloud infrastructure setup, CI/CD automated deployment pipelines & Docker containerization',
    status: 'Active',
    isSystem: false
  },
  {
    id: 'bcat-8',
    name: 'Marketing & Campaigns',
    code: 'MKT',
    color: '#D946EF',
    description: 'Performance marketing funnels, email sequences, paid ads & multi-channel launch campaigns',
    status: 'Active',
    isSystem: false
  }
];

export const DEFAULT_TEMPLATE_CATEGORIES = DEFAULT_BLUEPRINT_CATEGORIES;
