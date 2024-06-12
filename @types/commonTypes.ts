export type TName = {
  name: string;
};

export type TCode = {
  code: string;
};

export type TNameNo = {
  name: number;
};

export type TCodeNo = {
  code: number;
};

export type TDescription = {
  description: string;
};

export type TTitle = {
  title: string;
};

export type TColor = {
  color: string;
};

export type TStatus = {
  status: 'active' | 'inactive';
};

export type TDefault = {
  is_default: 'active' | 'inactive';
};

export type TDefaultOptional = {
  is_default?: 'active' | 'inactive';
};

export type TQueryParams = {
  pageSize?: string;
  pageNumber?: string;
  status?: 'active' | 'inactive';
  name?: string;
};

export type TTitleQueryParams = TQueryParams & {
  title?: string;
};

export type TQueryDefaultParams = TQueryParams & TDefaultOptional;
