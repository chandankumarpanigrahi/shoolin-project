import mongoose from 'mongoose';

const linkCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    desc: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LinkCategory =
  mongoose.models.LinkCategory || mongoose.model('LinkCategory', linkCategorySchema);
