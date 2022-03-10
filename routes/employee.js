const path = require('path');

const express = require('express');

const employeeController = require('../controllers/employee');

const router = express.Router();

router.get('/punch-in', employeeController.getPunchIn);

router.post('/punch-in', employeeController.postPunchIn);

// router.get('/punch-out', employeeController.getPunchOut);

// router.post('/punch-out', employeeController.postPunchOut);

// router.get('/annualleave', employeeController.getAnnualLeave);

// router.post('/annualleave', employeeController.postAnnualLeave);

router.get('/', employeeController.getEmployee);

module.exports = router;
