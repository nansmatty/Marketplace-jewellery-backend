import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import City from '../../models/Localization-Master-Models/CityModel';
import { TLocalizationQueryParams, TCity } from '../../@types/localizationTypes';
import { TStatus } from '../../@types/commonTypes';
import xlsx from 'xlsx';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { isAlpha, isUpperCaseString } from '../../utils/commonFunction';

const excelDataValidationCheck = (excelData: TCity[]) => {
  const errorsArray: any[] = [];
  let errorChecked = true;

  excelData.forEach((data: TCity, index: number) => {
    if (typeof data.name !== 'string' || !isAlpha(data.name)) {
      errorsArray.push({ index, message: `Name must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (typeof data.code !== 'string' || !isAlpha(data.code)) {
      errorsArray.push({ index, message: `Code must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (typeof data.state !== 'string' || !isUpperCaseString(data.state)) {
      errorsArray.push({ index, message: `State must be a non-empty string containing only string characters and should be in uppercase ${index}` });
    }

    // Validate status (optional)
    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      errorsArray.push({ index, message: `Status must be either 'active' or 'inactive' at index ${index}` });
    }
  });

  if (errorsArray.length > 0) {
    errorChecked = false;
    return { errorChecked, errorsArray };
  }

  return { errorChecked, errorsArray };
};

export const getAllCity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, state } = req.query as TLocalizationQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await City.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (state) {
      query.state = state;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allCity = await City.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allCity, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getCityById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = await City.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (city) {
      return res.status(200).json({ city });
    } else {
      return next(new ErrorHandler('City not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllCityBasedOnStateAndStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cities = await City.find({ $and: [{ state: req.params.state }, { status: 'active' }] });

    if (cities) {
      return res.status(200).json({ cities });
    } else {
      // return res.status(200).json({ message: "We don't deliver in this city" });
      return next(new ErrorHandler('Cities not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createCity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, state } = req.body as TCity;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const cityExists = await City.findOne({ $or: [{ name }, { code }] });

    if (cityExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const city = await City.create({ name, code, status, state });

    if (city) {
      return res.status(201).json({ message: 'City created' });
    } else {
      return next(new ErrorHandler('There is problem while creating city. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const bulkCityDataUpload = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const skippedItemIds: number[] = [];
    const file = req.file;
    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    //file buffering
    const cityWorkboook = xlsx.read(file.buffer);

    //mongodb schema fields headings
    const citySchemaFields = Object.keys(City.schema.obj);

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(cityWorkboook, citySchemaFields);

    if (!headingsMatch) {
      return next(new ErrorHandler('Excel headings do not match expected fields', 400));
    }

    const isValid = excelDataValidationCheck(jsonData);

    if (!isValid.errorChecked) {
      return next(new ErrorHandler(`Invalid loose diamond rate data format`, 400));
    }

    //Process jsonData and add in database
    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];

      const existingCity = await City.findOne({ $or: [{ name: item.name }, { code: item.code }] });

      if (existingCity) {
        existingCity.name = item.name || existingCity.name;
        existingCity.code = item.code || existingCity.code;
        existingCity.state = item.state || existingCity.state;
        existingCity.status = item.status || existingCity.status;

        existingCity.save({ validateModifiedOnly: true });
      } else {
        await City.create(item);
      }
    }

    res.json({ success: true, message: 'Data uploaded successfully' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, code, state } = req.body as TCity;

    const city = await City.findById({ _id: req.params.id });

    if (city) {
      city.name = name || city.name;
      city.code = code || city.code;
      city.state = state || city.state;
      city.status = status || city.status;

      await city.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'City updated.' });
    } else {
      return next(new ErrorHandler('City not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCityStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const city = await City.findById({ _id: req.params.id });

    if (city) {
      city.status = status || city.status;
      await city.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `City status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('City not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteCity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = await City.findById({ _id: req.params.id });

    if (city) {
      await city.deleteOne();
      return res.status(200).json({ message: 'City deleted.' });
    } else {
      return next(new ErrorHandler('City not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
