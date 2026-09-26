import mongoose from 'mongoose';

const masterBrandSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#2563EB' },
    status: { type: String, default: 'Active' },
    desc: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MasterBrand =
  mongoose.models.MasterBrand || mongoose.model('MasterBrand', masterBrandSchema);
