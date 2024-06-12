import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TMetalRate, TMetalRateUpdate, TPriceList } from '../../@types/ratecardTypes';
import MetalRateChart, { IPriceList } from '../../models/RateCard-Master-Models/MetalRateModel';
import { TRateChartQueryParams } from '../../@types/metalTypes';
import { TStatus } from '../../@types/commonTypes';
import { calculateMetalRate } from '../../utils/metalRateCalculation';

export const getAllMetalRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, title, metalPriceType } = req.query as TRateChartQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await MetalRateChart.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (title) {
      query.title = new RegExp(title, 'i');
    }

    if (metalPriceType) {
      query.metalPriceType = metalPriceType;
    }

    const allMetalRateCharts = await MetalRateChart.find(query).populate('metalPriceType', 'code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -__v');

    return res.status(200).json({ allMetalRateCharts, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getMetalRateChartById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalRateChart = await MetalRateChart.findById({ _id: req.params.id }).select('-createdAt -__v');

    if (metalRateChart) {
      return res.status(200).json({ metalRateChart });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
});

export const getAllMetalRateChartStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalRateCharts = await MetalRateChart.find({ status: 'active' }).select('-createdAt -__v');

    if (metalRateCharts) {
      return res.status(200).json({ metalRateCharts });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
});

export const createMetalRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, base_price, description, metalPriceType, pricelist, status } = req.body as TMetalRate;

    if (!(title || metalPriceType || pricelist.length < 0 || base_price)) {
      return next(new ErrorHandler('Please fill all the necessary fields', 400));
    }

    if (pricelist.length > 0) {
      pricelist.map((pl: TPriceList) => {
        const rate = calculateMetalRate(base_price, pl);
        pl.rate = rate;
        return pl;
      });
    }

    const metalRateChart = await MetalRateChart.create({
      title,
      base_price,
      description,
      metalPriceType,
      pricelist,
      status,
    });

    if (metalRateChart) {
      return res.status(201).json({ message: 'Metal Rate Chart Created!' });
    } else {
      return next(new ErrorHandler('There is problem while creating metal rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateMetalRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, base_price, description, pricelist, status } = req.body as TMetalRateUpdate;

    const metalRateChart = await MetalRateChart.findOne({ _id: req.params.id });

    if (metalRateChart) {
      const basePrice = base_price ? base_price : metalRateChart.base_price;

      metalRateChart.title = title || metalRateChart.title;
      metalRateChart.base_price = base_price || metalRateChart.base_price;
      metalRateChart.description = description || metalRateChart.description;
      metalRateChart.status = status || metalRateChart.status;
      if (pricelist && pricelist.length > 0) {
        metalRateChart.clearRateChart();
        const convertedPricelist = pricelist.map((pl: TPriceList) => {
          const rate = calculateMetalRate(basePrice, pl);
          pl.rate = rate;
          return pl;
        });
        metalRateChart.pricelist = convertedPricelist as IPriceList[];
      }
      await metalRateChart.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Metal rate chart updated successfully.` });
    } else {
      return next(new ErrorHandler('Metal rate chart not found', 404));
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
});

export const updateMetalRateChartStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const metalRateChart = await MetalRateChart.findById({ _id: req.params.id });

    if (metalRateChart) {
      metalRateChart.status = status || metalRateChart.status;
      await metalRateChart.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Metal rate status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteMetalRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metalRateChart = await MetalRateChart.findById({ _id: req.params.id });

    if (metalRateChart) {
      await metalRateChart.deleteOne();

      return res.status(200).json({ message: 'Metal rate deleted successfully.' });
    } else {
      return next(new ErrorHandler('There is problem while fetching metal rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
