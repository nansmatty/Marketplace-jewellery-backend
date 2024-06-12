import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import xlsx from 'xlsx';
import { TRateChart, TGeneralRateValidation } from '../../@types/ratecardTypes';
import ColorstoneRate, { IRateChart } from '../../models/RateCard-Master-Models/ColorstoneRateModel';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import { isAlpha } from '../../utils/commonFunction';

const excelDataValidationCheck = (excelData: TGeneralRateValidation[]) => {
  const errorsArray: any[] = [];

  excelData.forEach((data: TGeneralRateValidation, index: number) => {
    if (typeof data.colorstone_name !== 'string' || !isAlpha(data.colorstone_name)) {
      errorsArray.push({ index, message: `Colorstone name must be a non-empty string containing only alphabetic characters ${data.colorstone_name}` });
    }
    if (typeof data.rate !== 'number') {
      errorsArray.push({ index, message: 'Rate must be a number ${index}' });
    }
    if (data.discount_type && !['PERCENTAGE', 'FLAT'].includes(data.discount_type)) {
      errorsArray.push({ index, message: `Invalid discount type ${index}` });
    }
    if (data.discount_rate && typeof data.discount_rate !== 'number') {
      errorsArray.push({ index, message: `Discount rate must be a number ${index}` });
    }
  });

  if (errorsArray.length > 0) {
    return false;
  }

  return true;
};

export const getAllColorstoneRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await ColorstoneRate.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allColorstoneRates = await ColorstoneRate.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -__v');

    return res.status(200).json({ allColorstoneRates, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getColorstoneRateChartById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colorstoneRate = await ColorstoneRate.findById({ _id: req.params.id }).select('-createdAt -__v');

    if (colorstoneRate) {
      return res.status(200).json({ colorstoneRate });
    } else {
      return next(new ErrorHandler('There is problem while fetching colorstone rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createColorstoneRate = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { title, shape, status } = req.body as TRateChart;

    if (!title || !shape) {
      return next(new ErrorHandler('Please fill the required fields', 400));
    }

    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    const colorstoneRateWorkbook = xlsx.read(file.buffer);

    const rateChartFields = Object.keys(ColorstoneRate.schema.paths['ratechart'].schema.obj);

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(colorstoneRateWorkbook, rateChartFields);

    if (!headingsMatch) {
      return next(new ErrorHandler('Excel headings do not match expected fields', 400));
    }

    const isValid = excelDataValidationCheck(jsonData);

    if (!isValid) {
      return next(new ErrorHandler('Invalid colorstone rate data format', 400));
    }

    const colorstoneRate = await ColorstoneRate.create({
      title,
      shape,
      status,
      ratechart: jsonData,
    });

    if (colorstoneRate) {
      return res.status(201).json({ message: 'Colorstone Rate Chart Created!' });
    } else {
      return next(new ErrorHandler('There is problem while creating colorstone rate chart. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const updateColorstoneRate = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let jsonData: IRateChart[] = [];
    const file = req.file;
    const { title, shape, status } = req.body as TRateChart;

    const colorstoneRate = await ColorstoneRate.findById(req.params.id);

    if (!colorstoneRate) {
      return next(new ErrorHandler('There is problem while fetching colorstone rate chart. Please try after sometime', 400));
    }

    if (file) {
      colorstoneRate.clearRateChart();
      const colorstoneRateWorkbook = xlsx.read(file.buffer);
      const rateChartFields = Object.keys(ColorstoneRate.schema.paths['ratechart'].schema.obj);

      const { headingsMatch, excelDataConvertIntoJsonData } = excelHeadingMatch(colorstoneRateWorkbook, rateChartFields);

      if (!headingsMatch) {
        return next(new ErrorHandler('Excel headings do not match expected fields', 400));
      }

      const isValid = excelDataValidationCheck(excelDataConvertIntoJsonData);

      if (!isValid) {
        return next(new ErrorHandler('Invalid colorstone rate data format', 400));
      }

      jsonData = excelDataConvertIntoJsonData;
    }

    colorstoneRate.title = title || colorstoneRate.title;
    colorstoneRate.status = status || colorstoneRate.status;
    colorstoneRate.shape = shape || colorstoneRate.shape;
    colorstoneRate.ratechart = jsonData.length !== 0 ? jsonData : colorstoneRate.ratechart;

    await colorstoneRate.save({ validateModifiedOnly: true });

    // const updateData: Partial<IColorstoneRate> = {
    //   title: title || colorstoneRate.title,
    //   status: status || colorstoneRate.status,
    //   shape: shape || colorstoneRate.shape,
    //   ratechart: jsonData.length !== 0 ? jsonData : colorstoneRate.ratechart,
    // };

    // await ColorstoneRate.updateOne({ _id: req.params.id }, updateData, { runValidators: true });

    return res.status(200).json({ message: 'Colorstone rate updated' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateColorstoneRateStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const colorstoneRate = await ColorstoneRate.findById({ _id: req.params.id });

    if (colorstoneRate) {
      colorstoneRate.status = status || colorstoneRate.status;
      await colorstoneRate.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Colorstone rate status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('There is problem while fetching colorstone rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteColorstoneRate = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colorstoneRate = await ColorstoneRate.findById({ _id: req.params.id });

    if (colorstoneRate) {
      await colorstoneRate.deleteOne();

      return res.status(200).json({ message: 'Colorstone rate deleted.' });
    } else {
      return next(new ErrorHandler('There is problem while fetching colorstone rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
