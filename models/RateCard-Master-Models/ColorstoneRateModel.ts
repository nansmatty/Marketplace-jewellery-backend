import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IDiamondShape } from '../Diamond-Master-Models/DiamondShapeModel';
import ErrorHandler from '../../utils/errorHandler';

export interface IRateChart extends Document {
  colorstone_name: string;
  rate: number;
  discount_type: 'FLAT' | 'PERCENTAGE';
  discount_rate: number;
}

export interface IColorstoneRate extends Document {
  title: string;
  shape: Types.ObjectId | IDiamondShape;
  status: 'active' | 'inactive';
  ratechart: IRateChart[];
  clearRateChart: () => void;
}

const colorstoneRateSchema: Schema<IColorstoneRate> = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: true,
    },
    shape: {
      type: Schema.Types.ObjectId,
      ref: 'DiamondShape',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    ratechart: [
      {
        colorstone_name: {
          type: String,
          required: true,
        },
        rate: {
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
      },
    ],
  },
  { timestamps: true, collection: 'colorstone_rate' }
);

colorstoneRateSchema.pre<IColorstoneRate>('save', async function (next) {
  try {
    for (const rateChart of this.ratechart) {
      const colorstone = await mongoose.model('Colorstone').findOne({ code: rateChart.colorstone_name });

      if (!colorstone) {
        return next(new ErrorHandler('Colorstone not found', 404));
      }
    }
  } catch (error: any) {
    next(error);
  }
});

colorstoneRateSchema.methods.clearRateChart = function () {
  this.ratechart = [];
};

const ColorstoneRate: Model<IColorstoneRate> = mongoose.model('ColorstoneRate', colorstoneRateSchema);

export default ColorstoneRate;
