const express = require('express');

const covidController = require('../controllers/covid');

const router = express.Router();

router.get('/covidinfo', covidController.getCovidInfo);

router.get('/covidregistration', covidController.getCovidRegistration);

router.post('/covidregistration', covidController.postCovidRegistration);

module.exports = router;
