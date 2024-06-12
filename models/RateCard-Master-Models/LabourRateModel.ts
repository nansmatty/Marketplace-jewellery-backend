import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';
import { IMetalPriceType } from '../Metal-Master-Models/MetalPriceTypeModel';

export interface ILabourRate extends Document {
  title: string;
  metalPriceType: Types.ObjectId | IMetalPriceType;
  description: string;
  status: 'active' | 'inactive';
  labourPriceList: ILabourPriceList[];
  clearRateChart: () => void;
}

export interface ILabourPriceList extends Document {
  labour_type_name: string;
  initial_metal_labour_option: 'NO VALUE' | 'UPTO 1GM' | 'UPTO 1.5GM' | 'UPTO 2GM' | 'UPTO 2.5GM' | 'WASTAGE';
  initial_metal_labour_type: 'PERCENTAGE' | 'FLAT';
  initial_metal_labour_rate: number;
  metal_labour_type: 'PERCENTAGE' | 'FLAT';
  metal_labour_rate: number;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount_rate: number;
}

const labourPriceList: Schema<ILabourPriceList> = new mongoose.Schema({
  labour_type_name: {
    type: String,
    required: true,
  },
  initial_metal_labour_option: {
    type: String,
    enum: ['NO VALUE', 'UPTO 1GM', 'UPTO 1.5GM', 'UPTO 2GM', 'UPTO 2.5GM', 'WASTAGE'],
    default: 'NO VALUE',
    required: true,
  },
  initial_metal_labour_type: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    default: 'FLAT',
  },
  initial_metal_labour_rate: {
    type: Number,
    default: 0,
  },
  metal_labour_type: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    default: 'PERCENTAGE',
    required: true,
  },
  metal_labour_rate: {
    type: Number,
    required: true,
  },
  discount_type: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    default: 'FLAT',
  },
  discount_rate: {
    type: Number,
    default: 0,
  },
});

const labourRateSchema: Schema<ILabourRate> = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    metalPriceType: {
      type: Schema.Types.ObjectId,
      ref: 'MetalPriceType',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    description: {
      type: String,
    },
    labourPriceList: [labourPriceList],
  },
  { timestamps: true, collection: 'labour_rate_charts' }
);

labourRateSchema.pre<ILabourRate>('save', async function (next) {
  if (this.isModified('metalPriceType') && this.metalPriceType) {
    const metalPriceType = await mongoose.model('MetalPriceType').findById(this.metalPriceType);

    if (!metalPriceType) {
      return next(new ErrorHandler('Metal price type not found', 404));
    }
  }

  //TODO: After testing modification required................................

  if (this.isModified('labourPriceList')) {
    const labourPriceList: any[] = this.get('labourPriceList');
    for (const labourPrice of labourPriceList) {
      if (this.isModified(`labourPriceList.${labourPrice._id}.initial_metal_labour_option`)) {
        const modifiedOption = labourPrice.initial_metal_labour_option;
        if (modifiedOption !== 'NO VALUE' && labourPrice.initial_metal_labour_rate === 0) {
          // If initial_metal_labour_option is not 'NO VALUE' and initial_metal_labour_rate is 0
          // Handle the error or set a default value for initial_metal_labour_rate
          // For now, let's assume throwing an error
          return next(new ErrorHandler('Initial metal labour rate cannot be 0 if option is selected', 400));
        }
      }
    }
  }

  next();
});

labourRateSchema.methods.clearRateChart = function () {
  this.labourPriceList = [];
};

const LabourRateChart: Model<ILabourRate> = mongoose.model('LabourRateChart', labourRateSchema);

export default LabourRateChart;
