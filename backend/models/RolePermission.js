import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true, index: true },
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const RolePermission =
  mongoose.models.RolePermission || mongoose.model('RolePermission', rolePermissionSchema);
