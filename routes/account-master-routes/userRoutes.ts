import express from 'express';
import {
  forgot_password,
  getUserData,
  login,
  logoutUser,
  register,
  resend_otp,
  reset_password,
  update_password,
  update_user_profile,
  verify_user,
} from '../../controllers/accountMasterControllers/userControllers';
import { isAuthenticated } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/', isAuthenticated, getUserData);
router.post('/register', register);
router.post('/verify-user', verify_user);
router.post('/resend-otp', resend_otp);
router.post('/login', login);
router.post('/forgot-password', forgot_password);
router.put('/update-profile', isAuthenticated, update_user_profile);
router.post('/update-password', isAuthenticated, update_password);
router.post('/logout', isAuthenticated, logoutUser);
router.post('/reset-password/:resetToken', reset_password);

export default router;
