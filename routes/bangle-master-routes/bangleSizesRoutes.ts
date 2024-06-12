import express from 'express';
import {
  createBangleSize,
  deleteBangleSize,
  getAllBangleSize,
  getBangleSizeById,
  updateBangleSize,
  updateBangleSizeStatus,
} from '../../controllers/bangleMasterControllers/bangleSizeControllers';
const router = express.Router();

router.route('/').get(getAllBangleSize);
router.route('/create').post(createBangleSize);
router.route('/:id').get(getBangleSizeById).put(updateBangleSize).delete(deleteBangleSize);
router.route('/:id/change_status').put(updateBangleSizeStatus);

export default router;
