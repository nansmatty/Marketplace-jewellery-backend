import { Types } from 'mongoose';
import { TCode, TDescription, TName, TStatus } from './commonTypes';
import { IMetalPriceType } from '../models/Metal-Master-Models/MetalPriceTypeModel';
import { ILabourChargeType } from '../models/Labour-Master-Models/LabourChargeTypeModel';

export type TLabourChargeType = TName & TCode & TStatus;
export type TLabourChargeTypeUpdate = TName & TStatus;

export type TLabourCharge = TStatus &
  TDescription & {
    metalPriceType: Types.ObjectId | IMetalPriceType;
    labourChargeType: Types.ObjectId | ILabourChargeType;
  };
