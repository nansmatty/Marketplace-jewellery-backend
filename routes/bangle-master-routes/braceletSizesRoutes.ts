import express from 'express';
import {
  createBraceletSize,
  deleteBraceletSize,
  getAllBraceletSize,
  getBraceletSizeById,
  updateBraceletSize,
  updateBraceletSizeStatus,
} from '../../controllers/bangleMasterControllers/braceletSizeControllers';
const router = express.Router();

router.route('/').get(getAllBraceletSize);
router.route('/create').post(createBraceletSize);
router.route('/:id').get(getBraceletSizeById).put(updateBraceletSize).delete(deleteBraceletSize);
router.route('/:id/change_status').put(updateBraceletSizeStatus);

export default router;
