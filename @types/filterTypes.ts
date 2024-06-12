import { TCode, TDescription, TName, TStatus } from './commonTypes';

export type TMetalWeight = TName &
  TCode &
  TDescription &
  TStatus & {
    min_weight: number;
    max_weight: number;
  };

export type TMetalWeightUpdate = TName &
  TDescription &
  TStatus & {
    min_weight: number;
    max_weight: number;
  };

export type TPriceRange = TName &
  TCode &
  TDescription &
  TStatus & {
    min_amount: number;
    max_amount: number;
  };

export type TPriceRangeUpdate = TName &
  TDescription &
  TStatus & {
    min_amount: number;
    max_amount: number;
  };
