import mongoose, { Schema, Model, Document } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';
import City from './CityModel';

export interface IState extends Document {
  name: string;
  code: string;
  country: string;
  status: 'active' | 'inactive';
}

const stateSchema: Schema<IState> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    country: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'states',
  }
);

stateSchema.pre<IState>('save', async function (next) {
  const country = await mongoose.model('Country').findOne({ code: this.country });

  if (!country) {
    return next(new ErrorHandler('Country not found', 404));
  }

  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

stateSchema.pre<IState>('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await City.deleteMany({ state: this.code });
    next();
  } catch (err: any) {
    next(err);
  }
});

const State: Model<IState> = mongoose.model('State', stateSchema);

export default State;
