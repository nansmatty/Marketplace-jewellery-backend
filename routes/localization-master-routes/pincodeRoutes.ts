import express from 'express';
import {
  createPincode,
  deletePincode,
  getAllPincode,
  getPincodeById,
  bulkPincodeDataUpload,
  checkPincodeForAvailablity,
  updatePincode,
  updatePincodeStatus,
} from '../../controllers/localizationMasterControllers/pincodeControllers';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
const router = express.Router();

router.route('/').get(getAllPincode);
router.route('/create').post(createPincode);
router.route('/bulk-upload').post(singleFileUpload, bulkPincodeDataUpload);
router.route('/check-availblity/:pincode').get(checkPincodeForAvailablity);
router.route('/:id').get(getPincodeById).put(updatePincode).delete(deletePincode);
router.route('/:id/change_status').put(updatePincodeStatus);

export default router;
