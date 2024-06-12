import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IPermission } from './PermissionsModel';

export interface IRoles extends Document {
  name: string;
  code: string;
  status: 'active' | 'inactive';
  permissions_ids: Types.ObjectId[] | IPermission[];
  clearPermissionsIds: () => void;
  // updatePermissions: (permissions_ids: Types.ObjectId[] | IPermission[]) => void;
}

const rolesSchema: Schema<IRoles> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

rolesSchema.pre<IRoles>('save', async function (next) {
  if (!this.isModified('code')) return;

  let code = this.get('code').trim().toUpperCase();
  this.code = code;

  next();
});

rolesSchema.methods.clearPermissionsIds = function () {
  this.permissions_ids = [];
};

// Define mongoose method to update permissions_ids
// rolesSchema.methods.updatePermissions = function (permissions_ids: (Types.ObjectId | IPermission)[]) {
//   if (!permissions_ids || permissions_ids.length === 0) {
//     return;
//   }

//   // Filter out new permission IDs
//   const newPermissionIds = permissions_ids.filter((permissions_id) => !this.permissions_ids.includes(permissions_id));

//   // this.permissions_ids = this.permissions_ids.filter((permissions_id: Types.ObjectId | IPermission) => permissions_ids.includes(permissions_id));

//   // Push new permission IDs
//   this.permissions_ids.push(...newPermissionIds);
// };

const Roles: Model<IRoles> = mongoose.model('Roles', rolesSchema);

export default Roles;
