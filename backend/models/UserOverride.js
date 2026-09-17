import mongoose from 'mongoose';

const userOverrideSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const UserOverride =
  mongoose.models.UserOverride || mongoose.model('UserOverride', userOverrideSchema);
