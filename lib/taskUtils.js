/**
 * Universal Task Hierarchy & Parent-Child Relationship Helper
 * Safely determines if a task is a child of another task across MongoDB ObjectIds,
 * legacy/client temporary IDs, and hierarchical dot-notation task codes.
 */
export function isChildTask(child, parent, allTasks = []) {
  if (!child || !parent) return false;

  const childId = String(child.id || child._id || '');
  const parentId = String(parent.id || parent._id || '');

  // A task cannot be its own parent
  if (childId && parentId && childId === parentId) return false;

  // 1. Direct parentId matching
  if (child.parentId) {
    const cp = String(child.parentId);
    if (parentId && cp === parentId) return true;
    if (parent.id && cp === String(parent.id)) return true;
    if (parent._id && cp === String(parent._id)) return true;
    if (parent.code && cp === String(parent.code)) return true;
  }

  // 2. Direct parentCode matching (if explicitly set on child task)
  if (child.parentCode && parent.code && child.parentCode === parent.code) {
    if (!child.projectId || !parent.projectId || String(child.projectId) === String(parent.projectId)) {
      return true;
    }
  }

  // 3. Hierarchical code prefix fallback (e.g. child "PMV-299.1.1" under parent "PMV-299.1")
  if (child.code && parent.code) {
    const childProj = String(child.projectId || '');
    const parentProj = String(parent.projectId || '');
    if (!childProj || !parentProj || childProj === parentProj) {
      const parentCodeDot = `${parent.code}.`;
      if (child.code.startsWith(parentCodeDot)) {
        const remainder = child.code.slice(parentCodeDot.length);
        // Direct child if remainder is a simple index (e.g. "1", "2") with no further dots
        if (/^\d+$/.test(remainder)) {
          // Only fallback to code hierarchy if child's parentId does not match another existing valid task ID
          if (!child.parentId || !allTasks.some((t) => String(t.id || t._id) === String(child.parentId))) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
