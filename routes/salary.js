const path = require('path');

const express = require('express');

const salaryController = require('../controllers/salary');

const router = express.Router();

router.get('/salary', salaryController.getSalary);

router.post('/salary', salaryController.postSalary);

router.get('/workingtime', salaryController.getWorkingTime);

module.exports = router;
