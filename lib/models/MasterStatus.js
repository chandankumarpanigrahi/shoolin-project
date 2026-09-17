import mongoose from 'mongoose';

const masterStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    scope: { type: String, default: 'Global', index: true }, // 'Global' | 'Project' | 'Task'
    color: { type: String, default: 'indigo' },
    behavior: { type: String, default: 'inprogress' }, // 'backlog' | 'inprogress' | 'completed' | 'blocked' | 'review'
    marksAsCompleted: { type: Boolean, default: false },
    icon: { type: String, default: 'Circle' },
    status: { type: String, default: 'Active' },
    desc: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MasterStatus =
  mongoose.models.MasterStatus || mongoose.model('MasterStatus', masterStatusSchema);
