import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import RateConfiguration, { IRateConfiguration } from '../../models/Configuration-Master-Models/RateConfigurationModel';

export const getRateConfigurationById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //TODO: Change the enviroment variable to actual id after creating the data.
    const configId = process.env.RATE_CONFIGURATION_ID;
    const rateConfigurationData = await RateConfiguration.findById(configId);

    if (!rateConfigurationData) {
      return next(new ErrorHandler('Rate configuration data not found', 404));
    }

    return res.status(200).json({ rateConfigurationData });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createRateConfiguration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { custom_gold_rate, custom_platinum_rate, custom_silver_rate } = req.body as IRateConfiguration;

    if (!(custom_gold_rate || custom_platinum_rate || custom_silver_rate)) {
      return next(new ErrorHandler('Please fill all the fields ', 400));
    }

    const rateConfiguration = await RateConfiguration.create({
      set_custom: 1,
      custom_gold_rate,
      custom_platinum_rate,
      custom_silver_rate,
    });

    if (rateConfiguration) {
      return res.status(201).json({ message: 'Rate configuration created successfully' });
    } else {
      return next(new ErrorHandler('There is a problem while creating the rate configuration data. Please try after sometimes.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateRateConfiguration = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { custom_gold_rate, custom_platinum_rate, custom_silver_rate } = req.body as IRateConfiguration;
    //TODO: Change the enviroment variable to actual id after creating the data.
    const configId = process.env.RATE_CONFIGURATION_ID;
    const rateConfigurationData = await RateConfiguration.findById(configId);

    if (rateConfigurationData) {
      rateConfigurationData.custom_gold_rate = custom_gold_rate || rateConfigurationData.custom_gold_rate;
      rateConfigurationData.custom_platinum_rate = custom_platinum_rate || rateConfigurationData.custom_platinum_rate;
      rateConfigurationData.custom_silver_rate = custom_silver_rate || rateConfigurationData.custom_silver_rate;

      await rateConfigurationData.save({ validateModifiedOnly: true });

      res.status(200).json({ message: 'Rate configuration data updated' });
    } else {
      return next(new ErrorHandler('Rate configuration data not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
