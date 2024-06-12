// import { check } from 'express-validator';
import { validCodeCheck, validNameCheck } from './common-valid';

// export const categoryTypeFieldValidation = [check('categoryType').]

export const categoryTypeValidationCheck = [validNameCheck, validCodeCheck];

export const categoryValidationCheck = [validNameCheck, validCodeCheck];
