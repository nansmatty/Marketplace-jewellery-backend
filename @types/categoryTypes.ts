import { Types } from 'mongoose';
import { ICategoryType } from '../models/Category-Master-Models/CategoryTypeModel';
import { TCode, TName, TQueryParams, TStatus } from './commonTypes';

export type TCategoryTypeField = {
  categoryType: Types.ObjectId | ICategoryType;
};

export type TCategoryType = TName & TStatus & TCode;
export type TCategory = TName & TStatus & TCode & TCategoryTypeField;
export type TCategoryUpdate = TName & TCategoryTypeField;

export type TCategoryTypeQueryParams = TQueryParams & {
  categoryType?: Types.ObjectId | ICategoryType;
};
