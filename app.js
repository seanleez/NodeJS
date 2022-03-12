const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
// const employee = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const employeeRoutes = require('./routes/employee');
const editInfoRoutes = require('./routes/editinfo');
const salaryRoutes = require('./routes/salary');
const covidInfoRoutes = require('./routes/covid');
// parse the body of incoming request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(covidInfoRoutes);
app.use(salaryRoutes);
app.use(editInfoRoutes);
app.use(employeeRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        'mongodb+srv://vanviendong:thaonhinheo@cluster0.ua18c.mongodb.net/employee?retryWrites=true&w=majority'
    )
    .then((result) => {
        console.log('Connected');
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err);
    });
