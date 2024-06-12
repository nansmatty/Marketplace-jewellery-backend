import { Types } from 'mongoose';
import { TCode, TName, TQueryParams, TStatus } from './commonTypes';
import { IPermission } from '../models/Account-Master-Models/PermissionsModel';
import { IMasterModule } from '../models/Account-Master-Models/MasterModuleModel';
import { IUser } from '../models/Account-Master-Models/UserModel';

export type TMobileNo = {
  mobile_number: string;
};

export type TAccount = TName &
  TCode &
  TStatus & {
    permissions_ids: Types.ObjectId[] | IPermission[];
  };

export type TPermission = TName &
  TCode & {
    master_module_id: Types.ObjectId | IMasterModule;
  };

export type TKYCDataMobile = TMobileNo & {
  country_code: string;
};

export type TAddress = {
  user_id: Types.ObjectId | IUser;
  isSellerAddress: boolean;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  is_default: boolean;
};

export type TAddressQueryParams = TQueryParams & {
  isSellerAddress?: boolean;
  country?: string;
  state?: string;
  city?: string;
};
