import { check } from 'express-validator';
import sanitize from 'sanitize-html';

export const validNameCheck = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isAlpha('en-US', { ignore: ' ' })
    .withMessage('Name must contain only letters and spaces'),
];

export const validCodeCheck = [
  check('code')
    .notEmpty()
    .withMessage('Code is required')
    .isString()
    .withMessage('Code must be a string')
    .isAlpha('en-US', { ignore: ' ' })
    .withMessage('Code must contain only letters and spaces'),
];

export const validDescriptionCheck = [
  check('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isAlpha('en-US', { ignore: ' ' })
    .withMessage('Description must contain only letters and spaces'),
];

export const validColorCheck = [
  check('color')
    .notEmpty()
    .withMessage('Color is required')
    .isString()
    .withMessage('Color must be a string')
    .isAlpha('en-US', { ignore: ' ' })
    .withMessage('Color must contain only letters and spaces'),
];

export const validStatusCheck = [check('status').isIn(['active', 'inactive']).withMessage('Status must be either "active" or "inactive"')];

export const validQueryParamNameCheck = [
  check('name').isString().withMessage('Name must be a string').isAlpha('en-US', { ignore: ' ' }).withMessage('Name must contain only letters and spaces'),
];

const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'img', 'span'];
const allowedAttributes = {
  a: ['href', 'target'],
  img: ['src', 'alt'],
};

export const validDescriptionEditorCheck = [check('description').customSanitizer((value: string) => sanitize(value, { allowedTags, allowedAttributes }))];
