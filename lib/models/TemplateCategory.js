import mongoose from 'mongoose';

const templateCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, default: 'CAT' },
    color: { type: String, default: '#2563EB' },
    icon: { type: String, default: 'Layers' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    status: { type: String, default: 'Active' },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false }
);

export const TemplateCategory =
  mongoose.models.TemplateCategory || mongoose.model('TemplateCategory', templateCategorySchema);
