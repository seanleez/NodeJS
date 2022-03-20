const express = require('express');

const employeeController = require('../controllers/employee');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/editinfo', isAuth, employeeController.getEditInfo);

router.post('/editinfo', isAuth, employeeController.postEditInfo);

module.exports = router;
