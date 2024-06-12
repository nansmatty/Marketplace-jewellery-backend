import mongoose, { Document, Model, Types, Schema } from 'mongoose';
import { IMasterModule } from './MasterModuleModel';
import ErrorHandler from '../../utils/errorHandler';

export interface IPermission extends Document {
  name: string;
  code: string;
  master_module_id: Types.ObjectId | IMasterModule;
}

const permissionSchema: Schema<IPermission> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    master_module_id: {
      type: Schema.Types.ObjectId,
      ref: 'MasterModule',
    },
  },
  {
    timestamps: true,
    collection: 'permission',
  }
);

permissionSchema.pre<IPermission>('save', async function (next) {
  const masterModule = await mongoose.model('MasterModule').findById(this.master_module_id);

  if (!masterModule) {
    return next(new ErrorHandler('Master module not found', 404));
  }

  if (!this.isModified('code')) return;

  let code = this.get('code').trim().toUpperCase();
  this.code = code;

  next();
});

const Permission: Model<IPermission> = mongoose.model('Permission', permissionSchema);

export default Permission;
