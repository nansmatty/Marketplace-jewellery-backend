import express from 'express';
import {
  createCategoryType,
  deleteCategoryType,
  getAllCategoryType,
  getCategoryTypeById,
  updateCategoryTypeNameById,
  updateCategoryTypeStatus,
} from '../../controllers/categoryMasterControllers/categoryTypesControllers';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllCategoryType);
router.route('/create').post(createCategoryType);
router.route('/:id').get(getCategoryTypeById).put(updateCategoryTypeNameById).delete(deleteCategoryType);
router.route('/:id/change_status').put(updateCategoryTypeStatus);

export default router;
