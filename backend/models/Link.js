import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, default: 'General', index: true },
    type: { type: String, default: 'Tool' },
    subCategory: { type: String, default: '' },
    brand: { type: String, default: 'All' },
    addedBy: { type: String },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Link = mongoose.models.Link || mongoose.model('Link', linkSchema);
