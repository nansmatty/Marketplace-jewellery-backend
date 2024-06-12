import express from 'express';
import { bulkProductUpdateAndCreate } from '../../controllers/productMasterControllers/productControllers';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
import { isAdmin, isAuthenticated, isSuperAdmin, isVerifiedSeller } from '../../middlewares/authMiddleware';
const router = express.Router();

router.post('/', isAuthenticated, singleFileUpload, bulkProductUpdateAndCreate);

export default router;
