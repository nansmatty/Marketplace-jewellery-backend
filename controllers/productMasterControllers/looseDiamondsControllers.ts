import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import { TLooseDiamonds, TLooseDiamondsParams } from '../../@types/productTypes';
import LooseDiamond from '../../models/Product-Master-Models/LooseDiamondsModel';
import ErrorHandler from '../../utils/errorHandler';
import xlsx from 'xlsx';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { looseDiamondRateCalculation } from '../../utils/looseDiamondsRateCal';
import { isAlpha, looseDiamondMeasurementCheck } from '../../utils/commonFunction';
import { checkConnection, redis } from '../../config/redis';

const CACHE_KEY = 'LOOSE_DIAMONDS';
const CACHE_EXPIRY_SECONDS = 24 * 60 * 60;

const excelDataValidationCheck = (excelData: TLooseDiamonds[]) => {
  const errorsArray: any[] = [];
  let errorChecked = true;

  excelData.forEach((data: TLooseDiamonds, index: number) => {
    if (typeof data.item_id !== 'number') {
      errorsArray.push({ index, message: `Loose diamond item_id must be a number ${data.item_id}` });
    }

    if (typeof data.carat !== 'number') {
      errorsArray.push({ index, message: `Carat must be a number ${index}` });
    }

    if (typeof data.shape !== 'string' || !isAlpha(data.shape)) {
      errorsArray.push({ index, message: `Shape must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.color !== 'string' || !isAlpha(data.color)) {
      errorsArray.push({ index, message: `Color must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.clarity !== 'string' || !isAlpha(data.clarity)) {
      errorsArray.push({ index, message: `Clarity must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.cut !== 'string' || !isAlpha(data.cut)) {
      errorsArray.push({ index, message: `Cut must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.polish !== 'string' || !isAlpha(data.polish)) {
      errorsArray.push({ index, message: `Polish must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.symmetry !== 'string' || !isAlpha(data.symmetry)) {
      errorsArray.push({ index, message: `Symmetry must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.fluroscent !== 'string' || !isAlpha(data.fluroscent)) {
      errorsArray.push({ index, message: `Fluroscent must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.eye_clean !== 'string' || !isAlpha(data.eye_clean)) {
      errorsArray.push({ index, message: `Eyeclean must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.certificate !== 'string' || !isAlpha(data.certificate)) {
      errorsArray.push({ index, message: `Certificate must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.measurement !== 'string' || !looseDiamondMeasurementCheck(data.measurement)) {
      errorsArray.push({ index, message: `Measurement must be a non-empty string containing only alphabetic characters ${index}` });
    }

    if (typeof data.total_depth !== 'number') {
      errorsArray.push({ index, message: `Loose diamond total_depth must be a number ${index}` });
    }

    if (typeof data.table_width !== 'number') {
      errorsArray.push({ index, message: `Loose diamond table_width must be a number ${index}` });
    }

    if (typeof data.certificate_num !== 'number') {
      errorsArray.push({ index, message: `Certificate number must be a number ${index}` });
    }

    if (data.additional_charge_type && !['PERCENTAGE', 'FLAT'].includes(data.additional_charge_type)) {
      errorsArray.push({ index, message: `Invalid additional charge type ${index}` });
    }
    if (data.additional_charge && typeof data.additional_charge !== 'number') {
      errorsArray.push({ index, message: `Additional charge must be a number ${index}` });
    }
    if (data.discount_charge_type && !['PERCENTAGE', 'FLAT'].includes(data.discount_charge_type)) {
      errorsArray.push({ index, message: `Invalid discount type ${index}` });
    }
    if (data.discount_charge && typeof data.discount_charge !== 'number') {
      errorsArray.push({ index, message: `Discount charge must be a number ${index}` });
    }
    if (data.price_per_carat && typeof data.price_per_carat !== 'number') {
      errorsArray.push({ index, message: `Price per carat must be a number ${index}` });
    }
  });

  //TODO: Recheck the error retrun after value adding

  if (errorsArray.length > 0) {
    errorChecked = false;
    return { errorChecked, errorsArray };
  }

  return { errorChecked, errorsArray };
};

export const getAllLooseDiamonds = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, max_carat, max_final_price, min_carat, min_final_price } = req.query as TLooseDiamondsParams;

    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let looseDiamonds;

    const redisConnection = await checkConnection();

    if (redisConnection) {
      // Check if all loose diamonds data is available in Redis
      let cachedData = await redis.get(CACHE_KEY);

      if (!cachedData) {
        // If not available, fetch all loose diamonds data from the database
        const allLooseDiamonds = await LooseDiamond.find().select('-createdAt -updatedAt -__v');

        // Cache all loose diamonds data in Redis
        await redis.setex(CACHE_KEY, CACHE_EXPIRY_SECONDS, JSON.stringify(allLooseDiamonds));

        // Set cachedData to the fetched data
        cachedData = JSON.stringify(allLooseDiamonds);
      }

      looseDiamonds = JSON.parse(cachedData);
    } else {
      looseDiamonds = await LooseDiamond.find().select('-createdAt -updatedAt -__v');
    }

    // Apply pagination
    const count = looseDiamonds.length;
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);
    const paginatedData = looseDiamonds.slice(skipDoc, skipDoc + sizeOfPage);

    // Apply filtration
    const propertiesToCheck = ['shape', 'color', 'clarity', 'cut', 'polish', 'symmetry', 'fluroscent', 'eye_clean', 'certificate'];
    const filteredData = paginatedData.filter((diamond: any) => {
      for (const prop of propertiesToCheck) {
        if (req.query[prop] && diamond[prop] !== req.query[prop]) {
          return false;
        }
      }
      return true;
    });

    // Apply filtration
    const additionalFilteredData = filteredData.filter((diamond: any) => {
      if (max_carat && diamond.carat > Number(max_carat)) return false;
      if (min_carat && diamond.carat < Number(min_carat)) return false;
      if (max_final_price && diamond.final_price > Number(max_final_price)) return false;
      if (min_final_price && diamond.final_price < Number(min_final_price)) return false;
      // Add more filtration conditions here if needed
      return true;
    });

    return res.status(200).json({ loose_diamonds: additionalFilteredData, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getFiltersForLooseDiamonds = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await LooseDiamond.aggregate([
      {
        $group: {
          _id: null,
          maxRate: { $max: '$final_price' },
          minRate: { $min: '$final_price' },
          max_carat: { $max: '$carat' },
          min_carat: { $min: '$carat' },
        },
      },
    ]);

    if (result.length > 0) {
      const highestRate = result[0].maxRate;
      const lowestRate = result[0].minRate;
      const lowestCarat = result[0].min_carat;
      const highestCarat = result[0].max_carat;

      return res.status(200).json({ highestCarat, highestRate, lowestCarat, lowestRate });
    } else {
      return next(new ErrorHandler('No data found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const uploadLooseDiamondsExcelSheet = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skippedItemIds: number[] = [];
    const file = req.file;
    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    const looseDiamondWorkbook = xlsx.read(file.buffer);

    const looseDiamondSchemaFields = Object.keys(LooseDiamond.schema.obj);

    const looseDiamondFilteredDatabaseFields = looseDiamondSchemaFields.filter((field) => field !== 'price_per_carat_final' && field !== 'final_price');

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(looseDiamondWorkbook, looseDiamondFilteredDatabaseFields);

    if (!headingsMatch) {
      return next(new ErrorHandler('Excel headings do not match expected fields', 400));
    }

    const isValid = excelDataValidationCheck(jsonData);

    if (!isValid.errorChecked) {
      return next(new ErrorHandler(`Invalid loose diamond rate data format`, 400));
    }

    // Process jsonData
    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      const existingDiamond = await LooseDiamond.findOne({ item_id: item.item_id });

      // If the diamond with the same item_id exists, skip it
      if (existingDiamond) {
        skippedItemIds.push(item.item_id);
        jsonData.splice(i, 1); // Remove the current item from jsonData
        i--; // Decrement the index to account for the removed item
      } else {
        const { price_per_carat_final, final_price } = looseDiamondRateCalculation(
          item.carat,
          item.additional_charge_type,
          item.additional_charge,
          item.discount_charge_type,
          item.discount_charge,
          item.price_per_carat
        );

        // Set calculated values in the item object
        item.price_per_carat_final = price_per_carat_final;
        item.final_price = final_price;
        // Create a new diamond entry for the item
        await LooseDiamond.create(item);
      }
    }

    const redisConnection = await checkConnection();

    if (redisConnection) {
      let looseDiamondCachedData = await redis.get(CACHE_KEY);

      if (looseDiamondCachedData) {
        await redis.del(CACHE_KEY);
      }
    }

    res.json({ success: true, message: 'Data uploaded successfully', skippedItemIds });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createLooseDiamond = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      item_id,
      carat,
      shape,
      color,
      clarity,
      cut,
      polish,
      symmetry,
      fluroscent,
      eye_clean,
      certificate,
      measurement,
      total_depth,
      table_width,
      certificate_num,
      additional_charge_type,
      additional_charge,
      discount_charge_type,
      discount_charge,
      price_per_carat,
    } = req.body as TLooseDiamonds;

    if (
      !(
        item_id ||
        carat ||
        shape ||
        color ||
        clarity ||
        cut ||
        polish ||
        symmetry ||
        fluroscent ||
        eye_clean ||
        certificate ||
        measurement ||
        total_depth ||
        table_width ||
        certificate_num ||
        price_per_carat
      )
    ) {
      return next(new ErrorHandler('Please all the required fields', 400));
    }

    const existing_item_id = await LooseDiamond.findOne({ item_id });

    if (existing_item_id) {
      return next(new ErrorHandler('Item ID already in use. Please choose different item id.', 400));
    }

    const { price_per_carat_final, final_price } = looseDiamondRateCalculation(carat, additional_charge_type, additional_charge, discount_charge_type, discount_charge, price_per_carat);

    const looseDiamond = await LooseDiamond.create({
      item_id,
      carat,
      shape,
      color,
      clarity,
      cut,
      polish,
      symmetry,
      fluroscent,
      eye_clean,
      certificate,
      measurement,
      total_depth,
      table_width,
      certificate_num,
      additional_charge_type,
      additional_charge,
      discount_charge_type,
      discount_charge,
      price_per_carat,
      price_per_carat_final,
      final_price,
    });

    if (looseDiamond) {
      const redisConnection = await checkConnection();

      if (redisConnection) {
        let looseDiamondCachedData = await redis.get(CACHE_KEY);

        if (looseDiamondCachedData) {
          await redis.del(CACHE_KEY);
        }
      }
      return res.status(201).json({ message: 'Loose diamond created' });
    } else {
      return next(new ErrorHandler('There is problem while creating loose diamond. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
