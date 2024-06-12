import express from 'express';
import { createRateConfiguration, getRateConfigurationById, updateRateConfiguration } from '../../controllers/configurationsMasterControllers/rateConfigurationControllers';
import { isAdmin, isAuthenticated, isSuperAdmin, isVerifiedSeller } from '../../middlewares/authMiddleware';
const router = express.Router();

router
  .route('/')
  .get(isAuthenticated, isVerifiedSeller, isAdmin, isSuperAdmin, getRateConfigurationById)
  .post(isAuthenticated, createRateConfiguration)
  .put(isAuthenticated, isAdmin, isSuperAdmin, updateRateConfiguration);

export default router;
