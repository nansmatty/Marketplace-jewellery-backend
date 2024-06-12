import express from 'express';
import {
  createState,
  deleteState,
  getAllState,
  getStateById,
  bulkStateDataUpload,
  getAllStateBasedOnCountryAndStatus,
  updateState,
  updateStateStatus,
} from '../../controllers/localizationMasterControllers/stateControllers';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
const router = express.Router();

router.route('/').get(getAllState);
router.route('/create').post(createState);
router.route('/bulk-upload').post(singleFileUpload, bulkStateDataUpload);
router.route('/:id').get(getStateById).put(updateState).delete(deleteState);
router.route('/:id/change_status').put(updateStateStatus);
router.route('/list/:country/status/active').get(getAllStateBasedOnCountryAndStatus);

export default router;
