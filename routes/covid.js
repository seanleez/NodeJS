const express = require('express');

const covidController = require('../controllers/covid');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/covidinfo', isAuth, covidController.getCovidInfo);

router.get('/covidregistration', isAuth, covidController.getCovidRegistration);

router.post(
    '/covidregistration',
    isAuth,
    covidController.postCovidRegistration
);

module.exports = router;
