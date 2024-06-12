import express from 'express';
import { fileIUploadTest } from '../../../controllers/accountMasterControllers/KYC-Data-Controllers/kycDataControllers';
import { multiFileUpload } from '../../../middlewares/multerMiddleware';
const router = express.Router();

router.route('/file-uploads').post(multiFileUpload, fileIUploadTest);

export default router;
