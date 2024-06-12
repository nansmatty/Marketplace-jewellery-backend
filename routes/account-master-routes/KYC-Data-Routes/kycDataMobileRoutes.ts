import express from 'express';
import { addNewMobile, deleteMobileNo, getAllMobileByUserId, resendOTP, verifyMobileNo } from '../../../controllers/accountMasterControllers/KYC-Data-Controllers/kycDataMobileControllers';
import { isAuthenticated } from '../../../middlewares/authMiddleware';
const router = express.Router();

router.route('/').get(isAuthenticated, getAllMobileByUserId);
router.route('/create').post(isAuthenticated, addNewMobile);
router.route('/verify').put(isAuthenticated, verifyMobileNo);
router.route('/resend-otp').put(isAuthenticated, resendOTP);
router.route('/:id').delete(isAuthenticated, deleteMobileNo);

export default router;
