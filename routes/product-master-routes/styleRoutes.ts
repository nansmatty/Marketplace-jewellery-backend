import express from 'express';
import { createStyle, deleteStyle, getAllStyles, getStyleById, updateStyle, updateStyleStatus } from '../../controllers/productMasterControllers/styleControllers';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllStyles);
router.route('/create').post(createStyle);
router.route('/:id').get(getStyleById).put(updateStyle).delete(deleteStyle);
router.route('/:id/change_status').put(updateStyleStatus);

export default router;
