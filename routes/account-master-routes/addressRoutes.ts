import express from 'express';
import {
  createAddress,
  deleteAddress,
  getAllAddress,
  getAddressById,
  updateAddress,
  getAllAddressByUserId,
  markAddressIsDefaultByUser,
} from '../../controllers/accountMasterControllers/addressControllers';
import { isAdmin, isAuthenticated, isSuperAdmin } from '../../middlewares/authMiddleware';
const router = express.Router();

//TODO: Need to Add Authentication Flow

router.route('/').get(isAuthenticated, isAdmin, isSuperAdmin, getAllAddress);
router.route('/user-wise').get(isAuthenticated, getAllAddressByUserId);
router.route('/create').post(isAuthenticated, createAddress);
router.route('/:id').get(isAuthenticated, getAddressById).put(isAuthenticated, updateAddress).delete(isAuthenticated, deleteAddress);
router.route('/:id/marking').put(isAuthenticated, markAddressIsDefaultByUser);

export default router;
