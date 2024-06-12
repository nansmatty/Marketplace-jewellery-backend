import { Document } from 'mongoose';
import { TCode, TDefault, TDescription, TName, TStatus } from './commonTypes';

export interface ISolitare extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  is_default: 'active' | 'inactive';
}

export type TSolitare = TName & TCode & TDescription & TStatus & TDefault;
export type TSolitareUpdate = TName & TDescription & TStatus & TDefault;
