import express from 'express';
import {
  createMasterModule,
  deleteMasterModule,
  getAllMasterModule,
  getAllMasterModuleByStatus,
  getMasterModuleById,
  updateMasterModule,
  updateMasterModuleStatus,
} from '../../controllers/accountMasterControllers/masterModuleControllers';
const router = express.Router();

router.route('/').get(getAllMasterModule);
router.route('/create').post(createMasterModule);
router.route('/:id').get(getMasterModuleById).put(updateMasterModule).delete(deleteMasterModule);
router.route('/:id/change_status').put(updateMasterModuleStatus);
router.route('/list/status/active').get(getAllMasterModuleByStatus);

export default router;
