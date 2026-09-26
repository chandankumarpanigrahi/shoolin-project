import mongoose from 'mongoose';

const masterDepartmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    members: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MasterDepartment =
  mongoose.models.MasterDepartment || mongoose.model('MasterDepartment', masterDepartmentSchema);
