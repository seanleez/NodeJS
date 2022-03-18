const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const Employee = require('./models/employee');

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

app.use((req, res, next) => {
    Employee.find()
        .then((employees) => {
            return employees[0];
        })
        .then((employee) => {
            req.user = employee;
            next();
        })
        .catch((err) => console.log(err));
});

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
        Employee.findOne().then((employee) => {
            if (!employee) {
                const employee = new Employee({
                    name: 'Forrest Gump',
                    doB: new Date(1996, 4, 9),
                    salaryScale: 1.1,
                    startDate: new Date(2022, 1, 28),
                    department: 'HR',
                    annualLeave: 200,
                    imageUrl:
                        'https://i.pinimg.com/originals/ce/15/58/ce15584f4a9aaf701630a8902c6302c2.png',
                });
                employee.save();
            }
        });
        app.listen(3000);
    })
    .catch((err) => console.log(err));
