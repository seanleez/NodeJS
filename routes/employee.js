const path = require('path');

const express = require('express');

const employeeController = require('../controllers/employee');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/punch-in', isAuth, employeeController.getPunchIn);

router.post('/punch-in', isAuth, employeeController.postPunchIn);

router.get('/annualleave', isAuth, employeeController.getAnnualLeave);

router.post('/annualleave', isAuth, employeeController.postAnnualLeave);

router.get('/', employeeController.getEmployee);

module.exports = router;
