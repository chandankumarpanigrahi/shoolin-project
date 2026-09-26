import mongoose from 'mongoose';

const realtimeEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, expires: 300, index: true }, // Auto-expires after 5 mins
  }
);

export const RealtimeEvent =
  mongoose.models.RealtimeEvent || mongoose.model('RealtimeEvent', realtimeEventSchema);
