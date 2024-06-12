import { TCode, TCodeNo, TDefault, TDescription, TName, TNameNo, TQueryParams, TStatus } from './commonTypes';

export type TGeneral = TName & TCode & TDescription & TStatus;
export type TGeneralUpdate = TName & TDescription & TStatus;

export type TRingSizes = TNameNo & TCodeNo & TStatus & TDescription & TDefault;
export type TRingSizesUpdate = TNameNo & TStatus & TDescription & TDefault;

export type TFaq = TDescription &
  TStatus & {
    question: string;
  };

export type TFaqQueryParams = TQueryParams & {
  question?: string;
};
