const express = require('express');

const employeeController = require('../controllers/employee');

const router = express.Router();

router.get('/editinfo', employeeController.getEditInfo);

router.post('/editinfo', employeeController.postEditInfo);

module.exports = router;
