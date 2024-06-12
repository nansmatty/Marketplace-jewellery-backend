import mongoose, { Model, Schema, Document } from 'mongoose';

export interface IRateConfiguration extends Document {
  set_custom: 0 | 1;
  custom_gold_rate: number;
  custom_silver_rate: number;
  custom_platinum_rate: number;
}

const rateConfigurationModel: Schema<IRateConfiguration> = new Schema(
  {
    set_custom: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    custom_gold_rate: {
      type: Number,
      default: 0,
      required: true,
    },
    custom_platinum_rate: {
      type: Number,
      default: 0,
      required: true,
    },
    custom_silver_rate: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'rate_configurations',
  }
);

const RateConfiguration: Model<IRateConfiguration> = mongoose.model('RateConfiguration', rateConfigurationModel);

export default RateConfiguration;
