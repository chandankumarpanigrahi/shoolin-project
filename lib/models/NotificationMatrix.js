import mongoose from 'mongoose';

const notificationRuleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String },
  push: { type: Boolean, default: true },
  inApp: { type: Boolean, default: true },
  email: { type: Boolean, default: false },
  timing: { type: String, default: 'immediate' },
  badge: { type: String },
});

const userNotificationConfigSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    rules: [notificationRuleSchema],
    quietHours: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '22:00' },
      endTime: { type: String, default: '08:00' },
      allowCriticalEscalations: { type: Boolean, default: true },
      soundAlerts: { type: Boolean, default: true },
    },
    generalPrefs: {
      masterPush: { type: Boolean, default: true },
      inAppBanners: { type: Boolean, default: true },
      emailDigest: { type: Boolean, default: true },
    },
    pushSubscriptions: [
      {
        endpoint: { type: String, required: true },
        keys: {
          p256dh: { type: String, required: true },
          auth: { type: String, required: true },
        },
        deviceType: { type: String, default: 'desktop' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const NotificationConfig =
  mongoose.models.NotificationConfig || mongoose.model('NotificationConfig', userNotificationConfigSchema);
