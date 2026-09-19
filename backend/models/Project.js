import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    client: { type: String, default: 'PMV' },
    brand: { type: String, default: 'PMV' },
    type: { type: String, default: 'Strategic Initiative' },
    category: { type: String, default: 'General' },
    ownerId: { type: String, required: true, index: true },
    managerId: { type: String },
    teamIds: [{ type: String }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, default: 'In Progress', index: true },
    priority: { type: String, default: 'Medium' },
    startDate: { type: String },
    budget: { type: String, default: '0' },
    description: { type: String, default: '' },
    tasksCount: { type: Number, default: 0 },
    completedTasksCount: { type: Number, default: 0 },
    recurringConfig: { type: mongoose.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

projectSchema.index({ ownerId: 1, status: 1 });

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
