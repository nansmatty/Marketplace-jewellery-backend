import { NextFunction, Request, Response } from 'express';
import { TQueryParams, TStatus } from '../../@types/commonTypes';
import xlsx from 'xlsx';
import CatchAsyncError from '../../utils/catchAsyncError';
import DiamondRate, { IDiamondRateChart } from '../../models/RateCard-Master-Models/DiamondRateModel';
import ErrorHandler from '../../utils/errorHandler';
import { TDiamondRateValidation, TRateChart } from '../../@types/ratecardTypes';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import DiamondSieves from '../../models/Diamond-Master-Models/DiamondSievesModel';
import { isAlpha } from '../../utils/commonFunction';

const diamondSieveValueCheckAndTransform = async (jsonTransformData: any[], databaseFieldValue: string[], isGetMethod: boolean = false) => {
  const transformedData: any[] = [];

  for (let obj of jsonTransformData) {
    const transformedObj: any = {};

    if (isGetMethod) {
      obj = obj.toJSON();
    }

    for (const [key, value] of Object.entries(obj)) {
      if (databaseFieldValue.includes(key)) {
        transformedObj[key] = value;
      } else {
        let sieve = key;
        sieve = sieve.replace(/D/g, '.');

        if (!isGetMethod) {
          sieve = key.replace(/p/g, '+').replace(/m/g, '-');

          const sieveFound = await DiamondSieves.findOne({ code: sieve });

          if (!sieveFound || sieveFound.status !== 'active') {
            throw new ErrorHandler(`(${sieve}) is not in the Diamond Sieves List or Status is not active`, 404);
          }
          sieve = sieve.replace(/\./g, 'D');
        }

        transformedObj[sieve] = value;
      }
    }

    transformedData.push(transformedObj);
  }

  return { transformedData };
};

const excelDataValidationCheck = (excelData: TDiamondRateValidation[]) => {
  const errorsArray: any[] = [];

  excelData.forEach((data: TDiamondRateValidation, index: number) => {
    if (typeof data.diamondQuality !== 'string' || !isAlpha(data.diamondQuality)) {
      errorsArray.push({ index, message: `Colorstone name must be a non-empty string containing only alphabetic characters ${data.diamondQuality}` });
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

export const getAllDiamondRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber, status, name } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};

    const count = await DiamondRate.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allDiamondRates = await DiamondRate.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -__v -diamondRateChart');

    return res.status(200).json({ allDiamondRates, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getDiamondRateChartById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isGetMethod = true;

    const diamondRate = await DiamondRate.findById({ _id: req.params.id }).select('title shape status diamondRateChart updatedAt');

    const rateChartFields = Object.keys(DiamondRate.schema.paths['diamondRateChart'].schema.obj);
    rateChartFields.push('_id');

    if (diamondRate) {
      //TODO: Here the data transform function will be added to convert D to dot again

      const jsonTransformData = diamondRate.diamondRateChart;

      const { transformedData } = await diamondSieveValueCheckAndTransform(jsonTransformData, rateChartFields, isGetMethod);

      return res.status(200).json({ title: diamondRate.title, shape: diamondRate.shape, status: diamondRate.status, diamondRateChart: transformedData });

      // return res.status(200).json({ transformedData });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//TODO: Create Rate is still incomplete because of dynamic field spliting after dot and also update diamond Rate chart

export const createDiamondRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { title, shape, status } = req.body as TRateChart;

    if (!title || !shape) {
      return next(new ErrorHandler('Please fill the required fields', 400));
    }

    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    const diamondRateWorkbook = xlsx.read(file.buffer);

    const rateChartFields = Object.keys(DiamondRate.schema.paths['diamondRateChart'].schema.obj);

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(diamondRateWorkbook, rateChartFields);

    if (!headingsMatch) {
      return next(new ErrorHandler('Excel headings do not match expected fields', 400));
    }

    const isValid = excelDataValidationCheck(jsonData);

    if (!isValid) {
      return next(new ErrorHandler('Invalid diamond rate data format', 400));
    }

    const { transformedData } = await diamondSieveValueCheckAndTransform(jsonData, rateChartFields);

    const diamondRateChart = await DiamondRate.create({
      title,
      status,
      shape,
      diamondRateChart: transformedData,
    });

    if (diamondRateChart) {
      return res.status(201).json({ message: 'Diamond Rate Chart Created!' });
    } else {
      return next(new ErrorHandler('There is problem while creating diamond rate chart. Please try after sometime', 400));
    }

    // A testing return function
    // return res.status(200).json({ transformedData });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondRateChart = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let jsonData: IDiamondRateChart[] = [];
    const file = req.file;
    const { title, shape, status } = req.body as TRateChart;

    const diamondRate = await DiamondRate.findById(req.params.id);

    if (!diamondRate) {
      return next(new ErrorHandler('There is problem while fetching diamond rate chart. Please try after sometime', 400));
    }

    if (file) {
      diamondRate.clearRateChart();
      const diamondRateWorkbook = xlsx.read(file.buffer);

      const rateChartFields = Object.keys(DiamondRate.schema.paths['diamondRateChart'].schema.obj);

      const { headingsMatch, excelDataConvertIntoJsonData } = excelHeadingMatch(diamondRateWorkbook, rateChartFields);

      if (!headingsMatch) {
        return next(new ErrorHandler('Excel headings do not match expected fields', 400));
      }

      const isValid = excelDataValidationCheck(excelDataConvertIntoJsonData);

      if (!isValid) {
        return next(new ErrorHandler('Invalid diamond rate data format', 400));
      }

      const { transformedData } = await diamondSieveValueCheckAndTransform(excelDataConvertIntoJsonData, rateChartFields);

      jsonData = transformedData;
    }

    diamondRate.title = title || diamondRate.title;
    diamondRate.status = status || diamondRate.status;
    diamondRate.shape = shape || diamondRate.shape;
    diamondRate.diamondRateChart = jsonData.length !== 0 ? jsonData : diamondRate.diamondRateChart;

    await diamondRate.save({ validateModifiedOnly: true });

    // const updateData: Partial<IDiamondRateChart> = {
    //   title: title || diamondRate.title,
    //   status: status || diamondRate.status,
    //   shape: shape || diamondRate.shape,
    //   diamondRateChart: jsonData.length !== 0 ? jsonData : diamondRate.diamondRateChart,
    // };

    // await DiamondRate.updateOne({ _id: req.params.id }, updateData, {
    //   runValidators: true,
    // });
    return res.status(200).json({ message: `Diamond rate chart updated successfully.` });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateDiamondRateStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;
    const diamondRate = await DiamondRate.findById({ _id: req.params.id });

    if (diamondRate) {
      diamondRate.status = status || diamondRate.status;
      await diamondRate.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Diamond rate status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteDiamondRate = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diamondRate = await DiamondRate.findById({ _id: req.params.id });

    if (diamondRate) {
      await diamondRate.deleteOne();

      return res.status(200).json({ message: 'Diamond rate deleted.' });
    } else {
      return next(new ErrorHandler('There is problem while fetching diamond rate. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
