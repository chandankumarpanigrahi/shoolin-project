import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    // A hashed, short-lived code used for email OTP sign-in and password recovery.
    // Keeping it with the account makes the flow survive a server restart and avoids
    // accepting a shared development passcode.
    otpCodeHash: { type: String, select: false },
    otpPurpose: { type: String, enum: ['login', 'password-reset', ''], default: '' },
    otpExpiresAt: { type: Date, default: null },
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
