import express from 'express';
import { createPermission, deletePermission, getAllPermission, getPermissionById, updatePermission } from '../../controllers/accountMasterControllers/permissionControllers';
const router = express.Router();

router.route('/').get(getAllPermission);
router.route('/create').post(createPermission);
router.route('/:id').get(getPermissionById).put(updatePermission).delete(deletePermission);

export default router;
