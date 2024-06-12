import { ICountry } from '../models/Localization-Master-Models/CountryModel';
import { TCode, TName, TQueryParams, TStatus } from './commonTypes';

export type TLocalizationQueryParams = TQueryParams & {
  state?: string;
  city?: string;
  country?: string;
};

export type TCountry = TName &
  TCode &
  TStatus & {
    country_code: string;
    countryImage: string;
    totalCarat: number;
    belowCaratCharge: number;
    aboveCaratCharge: number;
  };

export type TState = TName &
  TCode &
  TStatus & {
    country: string;
  };

export type TCity = TName &
  TCode &
  TStatus & {
    state: string;
  };

export type TPincode = TName &
  TCode &
  TStatus & {
    is_cod_available: 0 | 1;
    deliver_within: number;
  };

export interface ICountryWithImage extends ICountry {
  imageUrl?: string; // Define imageUrl property
}
