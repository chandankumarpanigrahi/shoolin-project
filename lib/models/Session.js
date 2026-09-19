import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, index: true },
    userRole: { type: String, default: 'Employee' },
    avatar: { type: String },
    device: { type: String, default: 'Desktop Browser' },
    browser: { type: String, default: 'Chrome' },
    os: { type: String, default: 'Windows' },
    status: {
      type: String,
      enum: ['Active', 'Terminated', 'Expired'],
      default: 'Active',
      index: true,
    },
    loginAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      index: true,
    },
    terminatedAt: { type: Date },
    terminatedBy: { type: String },
  },
  { timestamps: true }
);

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
