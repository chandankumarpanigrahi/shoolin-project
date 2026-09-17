import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    title: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    parentId: { type: String, default: null, index: true },
    level: { type: Number, default: 0 },
    assignedTo: { type: String, index: true },
    status: { type: String, default: 'Not Started', index: true },
    priority: { type: String, default: 'Medium' },
    targetDate: { type: String, index: true },
    dueDate: { type: String },
    createdDate: { type: String },
    createdBy: { type: String },
    description: { type: String, default: '' },
    dependencies: [{ type: String }],
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, targetDate: 1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
