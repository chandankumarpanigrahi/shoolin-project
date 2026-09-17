import mongoose from 'mongoose';

const templateCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: 'indigo' },
    icon: { type: String, default: 'Layers' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TemplateCategory =
  mongoose.models.TemplateCategory || mongoose.model('TemplateCategory', templateCategorySchema);
