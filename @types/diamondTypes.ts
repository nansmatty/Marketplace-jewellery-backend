import { TCode, TDescription, TName, TStatus } from './commonTypes';

export type TDiamond = TName & TCode & TDescription & TStatus;
export type TDiamondUpdate = TName & TDescription;
