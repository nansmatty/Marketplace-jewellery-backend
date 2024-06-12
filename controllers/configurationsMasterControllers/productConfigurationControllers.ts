import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import ProductConfiguration, { IProductConfiguration } from '../../models/Configuration-Master-Models/ProductConfigurationModel';

export const getProductConfigurationById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //TODO: Change the enviroment variable to actual id after creating the data.
    const configId = process.env.PRODUCT_CONFIGURATION_ID;
    const productConfigurationData = await ProductConfiguration.findById(configId);

    if (!productConfigurationData) {
      return next(new ErrorHandler('Product configuration data not found', 404));
    }

    return res.status(200).json({ productConfigurationData });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createProductConfiguration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shippingAmountCriteria, gift_wrapping_charge, max_cod_amt, order_advance_payment, stamping_charges, hallmark_charge, cancel_order_days } = req.body as IProductConfiguration;

    if (shippingAmountCriteria.length === 0 || !(gift_wrapping_charge || max_cod_amt || order_advance_payment || stamping_charges || hallmark_charge || cancel_order_days)) {
      return next(new ErrorHandler('Please fill all the fields ', 400));
    }

    const productConfiguration = await ProductConfiguration.create({
      shippingAmountCriteria,
      gift_wrapping_charge,
      max_cod_amt,
      order_advance_payment,
      stamping_charges,
      hallmark_charge,
      cancel_order_days,
    });

    if (productConfiguration) {
      return res.status(201).json({ message: 'Product configuration created successfully' });
    } else {
      return next(new ErrorHandler('There is a problem while creating the product configuration data. Please try after sometimes.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateProductConfiguration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shippingAmountCriteria, gift_wrapping_charge, max_cod_amt, order_advance_payment, stamping_charges, hallmark_charge, cancel_order_days } = req.body as IProductConfiguration;

    //TODO: Change the enviroment variable to actual id after creating the data.
    const configId = process.env.PRODUCT_CONFIGURATION_ID;
    const productConfigurationData = await ProductConfiguration.findById(configId);

    if (productConfigurationData) {
      if (shippingAmountCriteria.length > 0) {
        productConfigurationData.clearShippingAmountCriteria();
        productConfigurationData.shippingAmountCriteria = shippingAmountCriteria;
      }

      productConfigurationData.gift_wrapping_charge = gift_wrapping_charge || productConfigurationData.gift_wrapping_charge;
      productConfigurationData.max_cod_amt = max_cod_amt || productConfigurationData.max_cod_amt;
      productConfigurationData.order_advance_payment = order_advance_payment || productConfigurationData.order_advance_payment;
      productConfigurationData.stamping_charges = stamping_charges || productConfigurationData.stamping_charges;
      productConfigurationData.hallmark_charge = hallmark_charge || productConfigurationData.hallmark_charge;
      productConfigurationData.cancel_order_days = cancel_order_days || productConfigurationData.cancel_order_days;

      await productConfigurationData.save({ validateModifiedOnly: true });

      res.status(200).json({ message: 'Product configuration data updated' });
    } else {
      return next(new ErrorHandler('Product configuration data not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
