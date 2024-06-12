import { Types } from 'mongoose';
import { IDiamondShape } from '../models/Diamond-Master-Models/DiamondShapeModel';
import { TDescription, TStatus, TTitle } from './commonTypes';
import { TMetalPriceType } from './metalTypes';
import { IMetalPriceType } from '../models/Metal-Master-Models/MetalPriceTypeModel';

export type TShape = {
  shape: Types.ObjectId | IDiamondShape;
};

export type TRateChart = TTitle & TShape & TStatus;
export type TGeneralRateValidation = {
  colorstone_name: string;
  rate: number;
  discount_type?: 'FLAT' | 'PERCENTAGE';
  discount_rate?: number;
};

export type TDiamondRateValidation = {
  diamondQuality: string;
  discount_type?: 'FLAT' | 'PERCENTAGE';
  discount_rate?: number;
};
export type TMetalRate = TTitle &
  TDescription &
  TStatus & {
    metalPriceType: Types.ObjectId | IMetalPriceType;
    base_price: number;
    pricelist: TPriceList[];
  };

export type TMetalRateUpdate = TTitle &
  TDescription &
  TStatus & {
    base_price: number;
    pricelist: TPriceList[];
  };

export type TPriceList = {
  metalPurity: string;
  metalType: string;
  percentage: number;
  additional_charge_type: 'PERCENTAGE' | 'FLAT';
  additional_charge: number;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount: number;
  description: string;
  rate: number;
};

export type TLabourRate = TTitle &
  TDescription &
  TStatus & {
    metalPriceType: Types.ObjectId | IMetalPriceType;
    labourPriceList: TLabourPriceList[];
  };

export type TLabourPriceList = {
  labour_type_name: string;
  initial_metal_labour_option: 'NO VALUE' | 'UPTO 1GM' | 'UPTO 1.5GM' | 'UPTO 2GM' | 'UPTO 2.5GM' | 'WASTAGE';
  initial_metal_labour_type: 'PERCENTAGE' | 'FLAT';
  initial_metal_labour_rate: number;
  metal_labour_type: 'PERCENTAGE' | 'FLAT';
  metal_labour_rate: number;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount_rate: number;
};
