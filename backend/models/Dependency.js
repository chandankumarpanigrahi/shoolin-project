import mongoose from 'mongoose';

const dependencySchema = new mongoose.Schema(
  {
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    relatedTaskId: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    dependencyDescription: { type: String, required: true },
    status: { type: String, default: 'Pending', index: true },
    expectedDate: { type: String },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

dependencySchema.index({ fromUserId: 1, toUserId: 1 });

export const Dependency =
  mongoose.models.Dependency || mongoose.model('Dependency', dependencySchema);
