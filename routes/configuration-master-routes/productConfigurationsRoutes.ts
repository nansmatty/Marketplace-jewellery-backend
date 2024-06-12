import express from 'express';
import { createProductConfiguration, getProductConfigurationById, updateProductConfiguration } from '../../controllers/configurationsMasterControllers/productConfigurationControllers';
import { isAdmin, isAuthenticated, isSuperAdmin, isVerifiedSeller } from '../../middlewares/authMiddleware';
const router = express.Router();

router
  .route('/')
  .get(isAuthenticated, isVerifiedSeller, isAdmin, isSuperAdmin, getProductConfigurationById)
  .post(isAuthenticated, createProductConfiguration)
  .put(isAuthenticated, isAdmin, isSuperAdmin, updateProductConfiguration);

export default router;
