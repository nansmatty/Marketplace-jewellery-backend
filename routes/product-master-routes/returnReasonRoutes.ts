import express from 'express';
import {
  createReturnReason,
  deleteReturnReason,
  getAllReturnReason,
  getReturnReasonById,
  updateReturnReason,
  updateReturnReasonStatus,
} from '../../controllers/productMasterControllers/returnReasonControllers';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllReturnReason);
router.route('/create').post(createReturnReason);
router.route('/:id').get(getReturnReasonById).put(updateReturnReason).delete(deleteReturnReason);
router.route('/:id/change_status').put(updateReturnReasonStatus);

export default router;
