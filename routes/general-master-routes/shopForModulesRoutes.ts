import express from 'express';
import {
  createShopForModule,
  deleteShopForModule,
  getAllShopForModule,
  geTGeneralById,
  updateShopForModule,
  updateShopForModuleStatus,
} from '../../controllers/generalMasterControllers/shopForModuleControllers';
const router = express.Router();

router.route('/').get(getAllShopForModule);
router.route('/create').post(createShopForModule);
router.route('/:id').get(geTGeneralById).put(updateShopForModule).delete(deleteShopForModule);
router.route('/:id/change_status').put(updateShopForModuleStatus);

export default router;
