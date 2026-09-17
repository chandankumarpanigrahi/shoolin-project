import webPush from 'web-push';
import { NotificationConfig } from '../models/NotificationMatrix.js';

// Configure Web Push with VAPID credentials if provided
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@shoolin-innovations.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Dispatch web push notification to target user based on their matrix rules
 */
export async function sendPushNotification({ userId, eventId, title, body, url, isCritical = false }) {
  try {
    const config = await NotificationConfig.findOne({ userId });
    if (!config) return;

    // Check Quiet Hours
    if (config.quietHours?.enabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = (config.quietHours.startTime || '22:00').split(':').map(Number);
      const [endH, endM] = (config.quietHours.endTime || '08:00').split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      const inQuietHours =
        startMin < endMin
          ? currentMinutes >= startMin && currentMinutes <= endMin
          : currentMinutes >= startMin || currentMinutes <= endMin;

      if (inQuietHours) {
        if (!isCritical || !config.quietHours.allowCriticalEscalations) {
          console.log(`[Push] Suppressed for ${userId} due to active Quiet Hours.`);
          return;
        }
      }
    }

    // Check rule channel permission
    if (eventId && config.rules?.length) {
      const rule = config.rules.find((r) => r.id === eventId);
      if (rule && !rule.push) {
        console.log(`[Push] Event ${eventId} disabled in user push preferences.`);
        return;
      }
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/favicon.ico',
      data: { url: url || '/dashboard' },
    });

    const sendPromises = (config.pushSubscriptions || []).map(async (sub) => {
      try {
        await webPush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Expired subscription -> remove it
          await NotificationConfig.updateOne(
            { userId },
            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
          );
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('[Push Service Error]:', error.message);
  }
}
