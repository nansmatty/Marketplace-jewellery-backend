import express from 'express';
import { createCategory, deleteCategory, getAllCategory, getCategoryById, updateCategory, updateTheStatusOfCategory } from '../../controllers/categoryMasterControllers/categoryControllers';
const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllCategory);
router.route('/create').post(createCategory);
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory);
router.route('/:id/change_status').put(updateTheStatusOfCategory);

export default router;
