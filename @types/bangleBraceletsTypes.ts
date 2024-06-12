import { TCodeNo, TDefault, TDescription, TName, TNameNo, TQueryParams, TStatus } from './commonTypes';

export type TBangleSize = TNameNo & TCodeNo & TStatus & TDescription & TDefault;
export type TBraceletSize = TName & TCodeNo & TStatus & TDescription & TDefault;

export type TBangleSizeUpdate = TNameNo & TStatus & TDescription & TDefault;
export type TBraceletSizeUpdate = TName & TStatus & TDescription & TDefault;
