import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';
import { IMetalPriceType } from '../Metal-Master-Models/MetalPriceTypeModel';

export interface IMetalRate extends Document {
  title: string;
  metalPriceType: Types.ObjectId | IMetalPriceType;
  description: string;
  status: 'active' | 'inactive';
  base_price: number;
  pricelist: IPriceList[];
  clearRateChart: () => void;
}

export interface IPriceList extends Document {
  metalPurity: string;
  metalType: string;
  percentage: number;
  additional_charge_type: 'PERCENTAGE' | 'FLAT';
  additional_charge: number;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount: number;
  description: string;
  rate: number;
}

const priceListSchema: Schema<IPriceList> = new mongoose.Schema({
  metalPurity: {
    type: String,
    required: true,
  },
  metalType: {
    type: String,
    required: true,
  },
  percentage: {
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
  discount_type: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    default: 'FLAT',
  },
  discount: {
    type: Number,
    default: 0,
  },
  rate: {
    type: Number,
    required: true,
  },
});

const metalRateChartSchema: Schema<IMetalRate> = new mongoose.Schema(
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
    base_price: {
      type: Number,
      required: true,
    },
    pricelist: [priceListSchema],
  },
  { timestamps: true, collection: 'metal_rate_charts' }
);

metalRateChartSchema.pre<IMetalRate>('save', async function (next) {
  if (this.isModified('metalPriceType') && this.metalPriceType) {
    const metalPriceType = await mongoose.model('MetalPriceType').findById(this.metalPriceType);

    if (!metalPriceType) {
      return next(new ErrorHandler('Metal price type not found', 404));
    }
    const existingMetalRates = await MetalRateChart.findOne({ metalPriceType: this.metalPriceType });

    if (existingMetalRates) {
      return next(new ErrorHandler('Metal rate is there with same metal type', 400));
    }
    next();
  }
});

metalRateChartSchema.methods.clearRateChart = function () {
  this.pricelist = [];
};

// metalRateChartSchema.pre<IMetalRate>('save', function (next) {
//   //Rate modify then modify the all price list
// });

const MetalRateChart: Model<IMetalRate> = mongoose.model('MetalRateChart', metalRateChartSchema);

export default MetalRateChart;
