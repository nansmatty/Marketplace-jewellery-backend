import express from 'express';
import {
  createCountry,
  deleteCountry,
  getAllCountry,
  getCountryById,
  bulkCountryDataUpload,
  getAllCountryBasedStatusActive,
  updateCountry,
  updateCountryStatus,
} from '../../controllers/localizationMasterControllers/countryControllers';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
const router = express.Router();

router.route('/').get(getAllCountry);
router.route('/create').post(singleFileUpload, createCountry);
router.route('/bulk-upload').post(singleFileUpload, bulkCountryDataUpload);
router.route('/:id').get(getCountryById).put(singleFileUpload, updateCountry).delete(deleteCountry);
router.route('/:id/change_status').put(updateCountryStatus);
router.route('/list/status/active').get(getAllCountryBasedStatusActive);

export default router;
