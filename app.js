const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const Employee = require('./models/employee');

const MONGODB_URI =
    'mongodb+srv://vanviendong:thaonhinheo@cluster0.ua18c.mongodb.net/employee';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const employeeRoutes = require('./routes/employee');
const editInfoRoutes = require('./routes/editinfo');
const salaryRoutes = require('./routes/salary');
const covidInfoRoutes = require('./routes/covid');
const authRoutes = require('./routes/auth');
// parse the body of incoming request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    Employee.findById(req.session.user._id)
        .then((employee) => {
            req.user = employee;
            next();
        })
        .catch((err) => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(covidInfoRoutes);
app.use(salaryRoutes);
app.use(editInfoRoutes);
app.use(employeeRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));
