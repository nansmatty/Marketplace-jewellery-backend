import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IPermission } from './PermissionsModel';

export interface IMasterModule extends Document {
  name: string;
  code: string;
  status: 'active' | 'inactive';
  permissions_ids: Types.ObjectId[] | IPermission[];
}

const masterModuleSchema: Schema<IMasterModule> = new mongoose.Schema(
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
    collection: 'master_module',
  }
);

masterModuleSchema.pre<IMasterModule>('save', async function (next) {
  // if (this.permissions_ids && this.permissions_ids.length > 0) {
  //   for (const permissionId of this.permissions_ids) {
  //     const checkPermissionId
  //   }
  // }

  if (!this.isModified('code')) return;

  let code = this.get('code').trim().toUpperCase();
  this.code = code;

  next();
});

const MasterModule: Model<IMasterModule> = mongoose.model('MasterModule', masterModuleSchema);

export default MasterModule;
