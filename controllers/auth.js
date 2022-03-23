const { validationResult } = require('express-validator/check');
const Employee = require('../models/employee');

exports.getLogin = (req, res, next) => {
    let errMessage = req.flash('error');
    if (errMessage.length > 0) {
        errMessage = errMessage[0];
    } else {
        errMessage = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        errorMessage: errMessage,
        oldInput: { username: '', password: '' },
        validationErrors: [],
    });
};

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { username: username, password: password },
            validationErrors: errors.array(),
        });
    }
    Employee.findOne({ username: username })
        .then((employee) => {
            if (!employee) {
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    errorMessage: 'Invalid username.',
                    oldInput: {
                        username: username,
                        password: password,
                    },
                    validationErrors: [{ param: 'username' }],
                });
            } else {
                if (employee.password === password) {
                    req.session.isLoggedIn = true;
                    req.session.user = employee;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                } else {
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Incorrect password.',
                        oldInput: {
                            username: username,
                            password: password,
                        },
                        validationErrors: [{ param: 'password' }],
                    });
                }
            }
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/login');
    });
};
