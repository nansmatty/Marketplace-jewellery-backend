import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOccasion extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const occasionSchema: Schema<IOccasion> = new mongoose.Schema(
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
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true, collection: 'occasions' }
);

occasionSchema.pre<IOccasion>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const Occasion: Model<IOccasion> = mongoose.model('Occasion', occasionSchema);

export default Occasion;
