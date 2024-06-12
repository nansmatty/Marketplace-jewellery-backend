import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IDiamondShape } from '../Diamond-Master-Models/DiamondShapeModel';
import ErrorHandler from '../../utils/errorHandler';

export interface IDiamondRate extends Document {
  title: string;
  shape: Types.ObjectId | IDiamondShape;
  status: 'active' | 'inactive';
  diamondRateChart: IDiamondRateChart[];
  clearRateChart: () => void;
}
export interface IDiamondRateChart extends Document {
  diamondQuality: string;
  discount_type: 'FLAT' | 'PERCENTAGE';
  discount_rate: number;
  [key: string]: number | any;
}

const diamondRateSchema: Schema<IDiamondRate> = new mongoose.Schema(
  {
    title: {
      type: String,
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
    diamondRateChart: [
      {
        diamondQuality: {
          type: String,
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
  { timestamps: true, strict: false, collection: 'diamond_rate_charts' }
);

diamondRateSchema.pre<IDiamondRate>('save', async function (next) {
  try {
    for (const rateChart of this.diamondRateChart) {
      const diamondRate = await mongoose.model('DiamondQuality').findOne({ code: rateChart.diamondQuality });

      if (!diamondRate) {
        return next(new ErrorHandler('Diamond quality not found', 404));
      }
    }
  } catch (error: any) {
    next(error);
  }
});

diamondRateSchema.methods.clearRateChart = function () {
  this.diamondRateChart = [];
};

const DiamondRate: Model<IDiamondRate> = mongoose.model('DiamondRate', diamondRateSchema);

export default DiamondRate;
