export type TUserEmailBody = {
  email: string;
};
export type TUserNameBody = {
  name: string;
};

export type TUserPasswordBody = {
  password: string;
};

export type TUserRegisterBody = TUserEmailBody &
  TUserPasswordBody &
  TUserNameBody & {
    mobile_number: string;
    country_code: string;
  };

export type TUserLoginBody = TUserEmailBody & TUserPasswordBody & {};

export interface ITokenOptions {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none' | undefined;
  secure?: boolean;
  expires?: Date;
  maxAge?: number;
}

export type TResetToken = {
  resetToken: string;
};

export type TUpdatePassword = TUserPasswordBody & {
  old_password: string;
};
