import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Software Development' },
    categoryId: { type: String, index: true },
    tasksTree: [{ type: mongoose.Schema.Types.Mixed }],
    taskCount: { type: Number, default: 0 },
    type: { type: String, default: 'Standard' },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);
