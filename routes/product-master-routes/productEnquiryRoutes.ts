import express from 'express';
import {
  deleteEnquiry,
  getAllEnquiries,
  getAllEnquiriesBasedOnSellerId,
  getAllEnquiryById,
  markRepliedOrResolvedEnquiry,
  sendProductEnquiry,
} from '../../controllers/productMasterControllers/productEnquiryControllers';
import { isAdmin, isAuthenticated, isSuperAdmin, isVerifiedSeller } from '../../middlewares/authMiddleware';
const router = express.Router();

router.route('/').get(isAuthenticated, isAdmin, isSuperAdmin, getAllEnquiries);
router.route('/list-by-seller').get(isAuthenticated, isVerifiedSeller, getAllEnquiriesBasedOnSellerId);
router.route('/send-enquiry').post(sendProductEnquiry);
router.route('/:id').get(isAuthenticated, isVerifiedSeller, isAdmin, isSuperAdmin, getAllEnquiryById).delete(isAuthenticated, isVerifiedSeller, isAdmin, isSuperAdmin, deleteEnquiry);
router.route('/:id/enquiry-marking').put(isAuthenticated, isVerifiedSeller, isAdmin, isSuperAdmin, markRepliedOrResolvedEnquiry);

export default router;
