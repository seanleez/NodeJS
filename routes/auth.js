const express = require('express');
const { body } = require('express-validator/check');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
    '/login',
    [
        body('username', 'Username cannot be empty.')
            .isLength({ min: 1 })
            .trim(),
        body('password', 'Invalid password.').isLength({ min: 5 }).trim(),
    ],
    authController.postLogin
);

router.post('/logout', authController.postLogout);

module.exports = router;
