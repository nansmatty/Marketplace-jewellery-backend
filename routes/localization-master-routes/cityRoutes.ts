import express from 'express';
import {
  createCity,
  deleteCity,
  getAllCity,
  getCityById,
  bulkCityDataUpload,
  getAllCityBasedOnStateAndStatus,
  updateCity,
  updateCityStatus,
} from '../../controllers/localizationMasterControllers/cityControllers';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
const router = express.Router();

router.route('/').get(getAllCity);
router.route('/create').post(createCity);
router.route('/bulk-upload').post(singleFileUpload, bulkCityDataUpload);
router.route('/:id').get(getCityById).put(updateCity).delete(deleteCity);
router.route('/:id/change_status').put(updateCityStatus);
router.route('/list/:state/status/active').get(getAllCityBasedOnStateAndStatus);

export default router;
