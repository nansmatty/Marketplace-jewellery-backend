import express from 'express';
import { createSocialLinks, getSocialLinksById, updateSocialLinks } from '../../controllers/configurationsMasterControllers/socialLinksControllers';
import { isAdmin, isAuthenticated, isSuperAdmin, isVerifiedSeller } from '../../middlewares/authMiddleware';
const router = express.Router();

router
  .route('/')
  .get(isAuthenticated, isVerifiedSeller, isAdmin, isSuperAdmin, getSocialLinksById)
  .post(isAuthenticated, createSocialLinks)
  .put(isAuthenticated, isAdmin, isSuperAdmin, updateSocialLinks);

export default router;
