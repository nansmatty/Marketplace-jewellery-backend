import express from 'express';
import { createRoles, deleteRoles, getAllRoles, getAllRolesByStatus, getRolesById, updateRoles, updateRolesStatus } from '../../controllers/accountMasterControllers/rolesControllers';
const router = express.Router();

router.route('/').get(getAllRoles);
router.route('/create').post(createRoles);
router.route('/:id').get(getRolesById).put(updateRoles).delete(deleteRoles);
router.route('/:id/change_status').put(updateRolesStatus);
router.route('/list/status/active').get(getAllRolesByStatus);

export default router;
