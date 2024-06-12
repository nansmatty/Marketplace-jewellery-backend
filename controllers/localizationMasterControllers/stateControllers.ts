import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import State from '../../models/Localization-Master-Models/StateModel';
import { TLocalizationQueryParams, TState } from '../../@types/localizationTypes';
import { TStatus } from '../../@types/commonTypes';
import xlsx from 'xlsx';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { isAlpha, isUpperCaseString } from '../../utils/commonFunction';

const excelDataValidationCheck = (excelData: TState[]) => {
  const errorsArray: any[] = [];
  let errorChecked = true;

  excelData.forEach((data: TState, index: number) => {
    if (typeof data.name !== 'string' || !isAlpha(data.name)) {
      errorsArray.push({ index, message: `Name must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (typeof data.code !== 'string' || !isAlpha(data.code)) {
      errorsArray.push({ index, message: `Code must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (typeof data.country !== 'string' || !isUpperCaseString(data.country)) {
      errorsArray.push({ index, message: `Country must be a non-empty string containing only string characters and should be in uppercase ${index}` });
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

export const getAllState = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status, country } = req.query as TLocalizationQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await State.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (country) {
      query.country = country;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allState = await State.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allState, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getStateById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await State.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (state) {
      return res.status(200).json({ state });
    } else {
      return next(new ErrorHandler('State not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllStateBasedOnCountryAndStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await State.find({ $and: [{ country: req.params.country }, { status: 'active' }] });

    if (state) {
      return res.status(200).json({ state });
    } else {
      // return res.status(200).json({ message: "We don't deliver in this state" });
      return next(new ErrorHandler('States not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createState = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, country } = req.body as TState;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const stateExists = await State.findOne({ $or: [{ name }, { code }] });

    if (stateExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const state = await State.create({ name, code, status, country });

    if (state) {
      return res.status(201).json({ message: 'State created' });
    } else {
      return next(new ErrorHandler('There is problem while creating state. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const bulkStateDataUpload = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const skippedItemIds: number[] = [];
    const file = req.file;
    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    //file buffering
    const stateWorkboook = xlsx.read(file.buffer);

    //mongodb schema fields headings
    const stateSchemaFields = Object.keys(State.schema.obj);

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(stateWorkboook, stateSchemaFields);

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

      const existingState = await State.findOne({ $or: [{ name: item.name }, { code: item.code }] });

      if (existingState) {
        existingState.name = item.name || existingState.name;
        existingState.code = item.code || existingState.code;
        existingState.country = item.country || existingState.country;
        existingState.status = item.status || existingState.status;

        existingState.save({ validateModifiedOnly: true });
      } else {
        await State.create(item);
      }
    }

    res.json({ success: true, message: 'Data uploaded successfully' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateState = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, code, country } = req.body as TState;

    const state = await State.findById({ _id: req.params.id });

    if (state) {
      state.name = name || state.name;
      state.code = code || state.code;
      state.country = country || state.country;
      state.status = status || state.status;

      await state.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'State updated.' });
    } else {
      return next(new ErrorHandler('State not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateStateStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const state = await State.findById({ _id: req.params.id });

    if (state) {
      state.status = status || state.status;
      await state.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `State status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('State not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteState = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await State.findById({ _id: req.params.id });

    if (state) {
      await state.deleteOne();
      return res.status(200).json({ message: 'State deleted.' });
    } else {
      return next(new ErrorHandler('State not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
