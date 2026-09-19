import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    details: { type: String, default: '' },
    module: { type: String, default: 'General' }, // 'AUTH' | 'SESSION' | 'USER_MGMT' | 'PROJECTS' | 'TASKS' | 'RBAC' | 'SECURITY'
    performedBy: { type: String, default: 'System' },
    performedByEmail: { type: String },
    performedByRole: { type: String },
    target: { type: String },
    device: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
