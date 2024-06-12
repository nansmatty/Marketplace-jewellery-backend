import mongoose, { Document, Model, Schema } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';

export interface ILooseDiamond extends Document {
  item_id: number;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluroscent: string;
  eye_clean: string;
  certificate: string;
  measurement: string;
  total_depth: number;
  table_width: number;
  certificate_num: number;
  additional_charge_type: 'PERCENTAGE' | 'FLAT';
  additional_charge: number;
  discount_charge_type: 'PERCENTAGE' | 'FLAT';
  discount_charge: number;
  price_per_carat: number;
  price_per_carat_final: number;
  final_price: number;
}

const looseDiamondSchema: Schema<ILooseDiamond> = new Schema(
  {
    item_id: {
      type: Number,
      default: 0,
      unique: true,
      required: true,
    },
    carat: {
      type: Number,
      default: 0,
      required: true,
    },
    shape: {
      type: String,
      default: '',
      required: true,
    },
    color: {
      type: String,
      default: '',
      required: true,
    },
    clarity: {
      type: String,
      default: '',
      required: true,
    },
    cut: {
      type: String,
      default: '',
    },
    polish: {
      type: String,
      default: '',
      required: true,
    },
    symmetry: {
      type: String,
      default: '',
      required: true,
    },
    fluroscent: {
      type: String,
      default: '',
      required: true,
    },
    eye_clean: {
      type: String,
      default: '',
      required: true,
    },
    certificate: {
      type: String,
      default: '',
      required: true,
    },
    measurement: {
      type: String,
      default: '',
      required: true,
    },
    total_depth: {
      type: Number,
      required: true,
    },
    table_width: {
      type: Number,
      required: true,
    },
    certificate_num: {
      type: Number,
      required: true,
    },
    additional_charge_type: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT'],
      default: 'FLAT',
    },
    additional_charge: {
      type: Number,
      default: 0,
    },
    discount_charge_type: {
      type: String,
      enum: ['PERCENTAGE', 'FLAT'],
      default: 'FLAT',
    },
    discount_charge: {
      type: Number,
      default: 0,
    },
    price_per_carat: {
      type: Number,
      default: 0,
      required: true,
    },
    price_per_carat_final: {
      type: Number,
      required: true,
    },
    final_price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'loose_diamonds',
  }
);

looseDiamondSchema.pre<ILooseDiamond>('save', async function (next) {
  try {
    if (this.isModified('shape') && this.shape) {
      const shape = await mongoose.model('SolitareShape').findOne({ code: this.shape });
      if (!shape) {
        return next(new ErrorHandler('Shape not found', 404));
      }
      next();
    }

    if (this.isModified('color') && this.color) {
      const color = await mongoose.model('SolitareColor').findOne({ code: this.color });
      if (!color) {
        return next(new ErrorHandler('Color not found', 404));
      }
      next();
    }

    if (this.isModified('clarity') && this.clarity) {
      const clarity = await mongoose.model('SolitareClarity').findOne({ code: this.clarity });
      if (!clarity) {
        return next(new ErrorHandler('Clarity not found', 404));
      }
      next();
    }

    if (this.isModified('cut') && this.cut) {
      const cut = await mongoose.model('SolitareCut').findOne({ code: this.cut });
      if (!cut) {
        return next(new ErrorHandler('Cut not found', 404));
      }
      next();
    }

    if (this.isModified('polish') && this.polish) {
      const polish = await mongoose.model('SolitarePolish').findOne({ code: this.polish });
      if (!polish) {
        return next(new ErrorHandler('Polish not found', 404));
      }
      next();
    }

    if (this.isModified('eye_clean') && this.eye_clean) {
      const eye_clean = await mongoose.model('SolitareEyeClean').findOne({ code: this.eye_clean });
      if (!eye_clean) {
        return next(new ErrorHandler('EyeClean not found', 404));
      }
      next();
    }

    if (this.isModified('symmetry') && this.symmetry) {
      const symmetry = await mongoose.model('SolitareSymmetry').findOne({ code: this.symmetry });
      if (!symmetry) {
        return next(new ErrorHandler('Symmetry not found', 404));
      }
      next();
    }

    if (this.isModified('fluroscent') && this.fluroscent) {
      const fluroscent = await mongoose.model('SolitareFluroscent').findOne({ code: this.fluroscent });
      if (!fluroscent) {
        return next(new ErrorHandler('Fluroscent not found', 404));
      }
      next();
    }

    if (this.isModified('certificate') && this.certificate) {
      const certificate = await mongoose.model('SolitareLabs').findOne({ code: this.certificate });
      if (!certificate) {
        return next(new ErrorHandler('Certificate not found', 404));
      }
      next();
    }
  } catch (error: any) {
    next(error);
  }
});

const LooseDiamond: Model<ILooseDiamond> = mongoose.model('LooseDiamond', looseDiamondSchema);

export default LooseDiamond;
