const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments, deleteDepartment, updateDepartment, toggleDepartmentStatus, addSubDepartment, removeSubDepartment } = require('../controllers/departmentController');
const { protect, superAdmin, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getDepartments)
    .post(protect, admin, createDepartment);

router.route('/:id')
    .delete(protect, admin, deleteDepartment)
    .put(protect, admin, updateDepartment);

router.put('/:id/toggle-status', protect, admin, toggleDepartmentStatus);
router.post('/:id/sub-departments', protect, admin, addSubDepartment);
router.delete('/:id/sub-departments/:subId', protect, admin, removeSubDepartment);

module.exports = router;
