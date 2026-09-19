import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, default: 'info' },
    title: { type: String, required: true },
    detail: { type: String, default: '' },
    link: { type: String, default: '' },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
