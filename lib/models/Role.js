import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    desc: { type: String, default: '' },
    color: { type: String, default: 'indigo' },
    isSystem: { type: Boolean, default: false },
    permissions: { type: Map, of: Boolean, default: {} },
  },
  { timestamps: true }
);

export const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
