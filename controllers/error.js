exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        isManager: req.user.username.includes('manager') ? true : false,
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        isManager: req.user.username.includes('manager') ? true : false,
        isAuthenticated: req.session.isLoggedIn,
    });
};
