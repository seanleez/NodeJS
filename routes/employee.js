const { body } = require('express-validator/check');

const express = require('express');

const employeeController = require('../controllers/employee');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/punch-in', isAuth, employeeController.getPunchIn);

router.post(
    '/punch-in',
    [body('date', 'Choose the date').isDate()],
    isAuth,
    employeeController.postPunchIn
);

router.get('/annualleave', isAuth, employeeController.getAnnualLeave);

router.post(
    '/annualleave',
    [
        body('dayoff', 'Choose the day off').isDate(),
        body('reason', 'Invalid reason').isString().isLength({ min: 3 }).trim(),
        body('hourOff', 'Fulfill hour off').isFloat(),
    ],
    isAuth,
    employeeController.postAnnualLeave
);

router.get('/manager', isAuth, employeeController.getManager);

router.get('/punchdata/:employeeId', isAuth, employeeController.getPunchData);

router.post('/punchdata/:employeeId',isAuth,employeeController.postPunchData)

router.get('/', isAuth, employeeController.getEmployee);

module.exports = router;
