import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    role: { type: String, default: 'User', index: true },
    department: { type: String, default: 'Operations' },
    avatar: { type: String },
    phone: { type: String },
    status: { type: String, default: 'Active' },
    lastActive: { type: String },
    otpCodeHash: { type: String, select: false },
    otpPurpose: { type: String, enum: ['login', 'password-reset', ''], default: '' },
    otpExpiresAt: { type: Date },
    isFirstTimeSetup: { type: Boolean, default: true },
    expandedTaskTreeNodes: [{ type: String }],
    pushSubscription: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
