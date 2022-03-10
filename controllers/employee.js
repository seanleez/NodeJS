const Employee = require('../models/employee');
const PunchData = require('../models/punchdata');

const employeeId = '6229c88d2f4378261411b104';
// fake database
// const annualLeave = {
//     employee_id: '30940394',
//     date: 13092022,
//     reason: 'sick',
//     hourOff: 8,
// };
// const punchData = {
//     employee_id: '30940394',
//     date: 13092022,
//     punch: [
//         {
//             workPlace: 'company',
//             startTime: 8,
//             finishTime: 12,
//             workingTime: 4,
//         },
//         {
//             workPlace: 'home',
//             startTime: 13,
//             finishTime: 17,
//             workingTime: 4,
//         },
//         {
//             workPlace: 'customer',
//             startTime: 18,
//             finishTime: 21,
//             workingTime: 3,
//         },
//         {
//             workPlace: 'customer',
//             startTime: 18,
//             finishTime: 21,
//             workingTime: 3,
//         },
//     ],
//     totalWorkingTime: 11,
//     overTime: 3,
// };

exports.getEmployee = (req, res, next) => {
    // res.render('employee', { pageTitle: 'Employee'});
    // In case employees collection has one user
    Employee.findById(employeeId)
        .then((employee) => {
            console.log(employee);
            res.render('employee', {
                pageTitle: 'Employee',
                employee: employee,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getPunchIn = (req, res, next) => {
    let tempEmployee;
    Employee.findById(employeeId)
        .then((employee) => {
            tempEmployee = { ...employee._doc };
            console.log('tempEmployee', tempEmployee);
        })
        .catch((err) => {
            console.log(err);
        });

    // Method find return an array of elements
    PunchData.find({
        _id: '622a1e1ca5bfcf29d8c69f6d',
    })
        .then((punchdata) => {
            console.log('punchData', punchdata);
            res.render('employee/punchin', {
                pageTitle: 'Punch In',
                employee: tempEmployee,
                punchData: punchdata[0],
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postPunchIn = (req, res, next) => {
    console.log(req.body);

    const workPlace = req.body.workPlace;
    const punchDate = req.body.date;
    const currentDate = new Date();

    const punchData = new PunchData({
        employee_id: employeeId,
        date: punchDate,
        punch: {
            shift: [
                {
                    workPlace: workPlace,
                    startTime: currentDate,
                    finishTime: currentDate,
                    shiftWorkingTime: 0,
                },
            ],
        },
        dailyWorkingTime: 0,
        overTime: 0,
    });

    punchData
        .save()
        .then((result) => {
            console.log(result);
            res.redirect('/punch-in');
        })
        .catch((err) => {
            console.log(err);
        });
};

// exports.getPunchOut = (req, res, next) => {
//     res.render('employee/punchout', {
//         pageTitle: 'Punch Out',
//         employee: employee,
//         punchData: punchData,
//     });
// };

// exports.postPunchOut = (req, res, next) => {
//     console.log(req.body);
//     res.redirect('/punch-out');
// };

// exports.getAnnualLeave = (req, res, next) => {
//     res.render('employee/annualleave', {
//         pageTitle: 'Annual Leave',
//         employee: employee,
//     });
// };

// exports.postAnnualLeave = (req, res, next) => {
//     console.log(req.body);
//     res.redirect('/annualleave');
// };

exports.getEditInfo = (req, res, next) => {
    // In case employees collection has one user
    Employee.findById(employeeId)
        .then((employee) => {
            console.log(employee);
            res.render('editinfo/editinfo', {
                pageTitle: 'Edit Info',
                employee: employee,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postEditInfo = (req, res, next) => {
    const updatedImageUrl = req.body.imageUrl;
    Employee.findById(employeeId)
        .then((employee) => {
            employee.imageUrl = updatedImageUrl;
            employee.save();
        })
        .then((result) => {
            console.log('Updated Employee');
            res.redirect('/editinfo');
        })
        .catch((err) => {
            console.log(err);
        });
};
