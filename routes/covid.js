const express = require('express');
const { body } = require('express-validator/check');

const covidController = require('../controllers/covid');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/covidinfo', isAuth, covidController.getCovidInfo);

router.get('/covidregistration', isAuth, covidController.getCovidRegistration);

router.get('/seeemployeesinfor', isAuth, covidController.getSeeEmployeesInfor);

router.get(
    '/seeemployeesinfor/:employeeId',
    isAuth,
    covidController.getCovidInformation
);

router.post(
    '/covidregistration',
    [
        body('vaccineShot1', 'Vaccine Shot 1 cannot be empty.')
            .isLength({ min: 1 })
            .trim(),
        body('dateShot1', 'Date Shot 1 cannot be empty').isDate(),
        body('vaccineShot2', 'Vaccine Shot 2 cannot be empty.')
            .isLength({ min: 1 })
            .trim(),
        body('dateShot2', 'Date Shot 2 cannot be empty').isDate(),
        body('bodyTemprature', 'Body Temprature cannot be empty')
            .isLength({ min: 1 })
            .trim(),
    ],
    isAuth,
    covidController.postCovidRegistration
);

module.exports = router;
