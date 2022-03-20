const express = require('express');

const salaryController = require('../controllers/salary');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/salary', isAuth, salaryController.getSalary);

router.post('/salary', isAuth, salaryController.postSalary);

router.get('/workingtime', isAuth, salaryController.getWorkingTime);

module.exports = router;
