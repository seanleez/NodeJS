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
    });
};

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    Employee.findOne({ username: username })
        .then((employee) => {
            if (!employee) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/login');
            } else {
                if (employee.password === password) {
                    req.session.isLoggedIn = true;
                    req.session.user = employee;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect('/');
                    });
                } else {
                    req.flash('error', 'Invalid username or password');
                    return res.redirect('/login');
                }
            }
        })
        .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/login');
    });
};
