import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    role: { type: String, default: 'Employee', index: true },
    department: { type: String, default: 'Operations' },
    avatar: { type: String },
    phone: { type: String },
    status: { type: String, default: 'Active' },
    lastActive: { type: String },
    pushSubscription: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
