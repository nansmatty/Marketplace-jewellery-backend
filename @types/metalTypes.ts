import { Types } from 'mongoose';
import { IMetalPriceType } from '../models/Metal-Master-Models/MetalPriceTypeModel';
import { TCode, TDescription, TName, TQueryParams, TStatus } from './commonTypes';

export type TPercentage = {
  percentage: number;
};

export type TMetalPriceType = TName & TCode & TStatus;
export type TMetal = TName &
  TCode &
  TStatus &
  TDescription &
  TPercentage & {
    metalPriceType: Types.ObjectId | IMetalPriceType;
  };
export type TMetalUpdate = TName &
  TDescription &
  TPercentage &
  TStatus & {
    metalPriceType: Types.ObjectId | IMetalPriceType;
  };

export type TRateChartQueryParams = TQueryParams & {
  metalPriceType?: Types.ObjectId | IMetalPriceType;
  title?: string;
};
