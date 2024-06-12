import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import LabourRateChart, { ILabourPriceList } from '../../models/RateCard-Master-Models/LabourRateModel';
import ErrorHandler from '../../utils/errorHandler';
import { TLabourRate } from '../../@types/ratecardTypes';
import { TStatus } from '../../@types/commonTypes';
import { TRateChartQueryParams } from '../../@types/metalTypes';

export const getAllLabourRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, title, metalPriceType } = req.query as TRateChartQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await LabourRateChart.countDocuments();
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

    const allLabourRateCharts = await LabourRateChart.find(query).populate('metalPriceType', 'code').limit(sizeOfPage).skip(skipDoc).select('-createdAt -__v');

    return res.status(200).json({ allLabourRateCharts, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getLabourRateChartById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourRateChart = await LabourRateChart.findById({ _id: req.params.id }).select('-createdAt -__v');

    if (labourRateChart) {
      return res.status(200).json({ labourRateChart });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
});

export const getAllLabourRateChartStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourRateCharts = await LabourRateChart.find({ status: 'active' }).populate('metalPriceType', 'code').select('-createdAt -__v');

    if (labourRateCharts) {
      return res.status(200).json({ labourRateCharts });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
});

export const createLabourRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, metalPriceType, status, labourPriceList } = req.body as TLabourRate;

    if (!(title || metalPriceType || labourPriceList.length < 0)) {
      return next(new ErrorHandler('Please fill all the necessary fields', 400));
    }

    //TODO: CHanges will happen when the seller module will be added

    const labourRateExists = await LabourRateChart.findOne({ metalPriceType });

    if (labourRateExists) {
      return next(new ErrorHandler('Labour rate chart already exists.', 400));
    }

    const labourRateChart = await LabourRateChart.create({
      title,
      description,
      metalPriceType,
      status,
      labourPriceList,
    });

    if (labourRateChart) {
      return res.status(201).json({ message: 'Labour Rate Chart Created!' });
    } else {
      return next(new ErrorHandler('There is problem while creating labour rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateLabourRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, labourPriceList, status } = req.body as TLabourRate;

    const labourRateChart = await LabourRateChart.findOne({ _id: req.params.id });

    if (labourRateChart) {
      labourRateChart.title = title || labourRateChart.title;
      labourRateChart.description = description || labourRateChart.description;
      labourRateChart.status = status || labourRateChart.status;
      if (labourPriceList && labourPriceList.length > 0) {
        labourRateChart.clearRateChart();
        for (const labourPrice of labourPriceList as ILabourPriceList[]) {
          const newLabourPrice = labourPrice;
          labourRateChart.labourPriceList.push(newLabourPrice);
        }
      }
      await labourRateChart.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Labour rate chart updated successfully.` });
    } else {
      return next(new ErrorHandler('Labour rate chart not found', 404));
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
});

export const updateLabourRateChartStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const labourRateChart = await LabourRateChart.findById({ _id: req.params.id });

    if (labourRateChart) {
      labourRateChart.status = status || labourRateChart.status;
      await labourRateChart.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Labour rate status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteLabourRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const labourRateChart = await LabourRateChart.findById({ _id: req.params.id });

    if (labourRateChart) {
      await labourRateChart.deleteOne();

      return res.status(200).json({ message: 'Labour rate deleted successfully.' });
    } else {
      return next(new ErrorHandler('There is problem while fetching labour rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
