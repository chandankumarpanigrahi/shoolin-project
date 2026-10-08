import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Website Development' },
    categoryId: { type: String, index: true },
    tasksTree: [{ type: mongoose.Schema.Types.Mixed }],
    tasksPreview: [{ type: String }],
    taskCount: { type: Number, default: 0 },
    tasksCount: { type: Number, default: 0 },
    maxDepth: { type: Number, default: 1 },
    defaultDuration: { type: String, default: '60 Days' },
    recurringDay: { type: String, default: '1st of every month' },
    type: { type: String, default: 'one-time' },
    isDefault: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: true },
    createdBy: { type: String, default: 'Current User' },
    lastUpdated: { type: String },
    status: { type: String, default: 'Active' },
    code: { type: String }
  },
  { timestamps: true, strict: false }
);

export const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);
