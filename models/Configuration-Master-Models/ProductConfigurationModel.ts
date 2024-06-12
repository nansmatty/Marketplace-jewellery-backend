import mongoose, { Model, Schema, Document } from 'mongoose';

export interface IShippingAmountCriteria {
  from: number;
  to: number;
  shippingCharge: number;
}

export interface IProductConfiguration extends Document {
  shippingAmountCriteria: IShippingAmountCriteria[];
  gift_wrapping_charge: number;
  max_cod_amt: number;
  order_advance_payment: number;
  stamping_charges: number;
  hallmark_charge: number;
  cancel_order_days: number;
  clearShippingAmountCriteria: () => void;
}

const productConfigurationSchema: Schema<IProductConfiguration> = new Schema(
  {
    shippingAmountCriteria: [
      {
        from: {
          type: Number,
          default: 0,
          required: true,
        },
        to: {
          type: Number,
          default: 0,
          required: true,
        },
        shippingCharge: {
          type: Number,
          default: 0,
          required: true,
        },
      },
    ],
    gift_wrapping_charge: {
      type: Number,
      default: 0,
      required: true,
    },
    max_cod_amt: {
      type: Number,
      default: 0,
      required: true,
    },
    order_advance_payment: {
      type: Number,
      default: 0,
      required: true,
    },
    stamping_charges: {
      type: Number,
      default: 0,
      required: true,
    },
    hallmark_charge: {
      type: Number,
      default: 0,
      required: true,
    },
    cancel_order_days: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true, collection: 'product_configurations' }
);

productConfigurationSchema.methods.clearShippingAmountCriteria = function () {
  this.shippingAmountCriteria = [];
};

const ProductConfiguration: Model<IProductConfiguration> = mongoose.model('ProductConfiguration', productConfigurationSchema);

export default ProductConfiguration;
