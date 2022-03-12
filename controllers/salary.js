const Employee = require('../models/employee');
const PunchData = require('../models/punchdata');

const employeeId = '622c10eb5d3ae36d71eb16bc';
var monthSalary;
exports.getSalary = (req, res, next) => {
    let hasPunchData = false;
    let tempEmployee;
    Employee.findById(employeeId)
        .then((employee) => {
            tempEmployee = { ...employee._doc };
        })
        .then(() => {
            PunchData.find({
                employee_id: employeeId,
            }).then((punchdatas) => {
                const salaryScale = tempEmployee.salaryScale;
                let totalOverTimeInMonth = 0;

                for (const p of punchdatas) {
                    if (p.date.getMonth() + 1 === Number(monthSalary)) {
                        hasPunchData = true;
                        console.log(p);
                        totalOverTimeInMonth += p.overTime;
                    }
                }
                const calculatedSalary =
                    salaryScale * 3000000 +
                    (totalOverTimeInMonth / 60) * 2000000;

                res.render('salary/salary', {
                    pageTitle: 'Salary',
                    hasPunchData: hasPunchData,
                    monthSalary: monthSalary,
                    salaryScale: salaryScale,
                    overTime: totalOverTimeInMonth,
                    salary: calculatedSalary,
                    employee: tempEmployee,
                });
            });
        })
        .catch((err) => console.log(err));
};

exports.postSalary = (req, res, next) => {
    monthSalary = req.body.monthSalary;
    res.redirect('/salary');
};

exports.getWorkingTime = (req, res, next) => {
    let tempEmployee;
    Employee.findById(employeeId)
        .then((employee) => {
            tempEmployee = { ...employee._doc };
        })
        .then(() => {
            PunchData.find({
                employee_id: employeeId,
            })
                .then((punchdatas) => {
                    console.log(punchdatas);
                    console.log(tempEmployee);
                    res.render('salary/workingtime', {
                        pageTitle: 'Working Time',
                        employee: tempEmployee,
                        punchDatas: punchdatas.sort((p1, p2) =>
                            p1.date > p2.date ? 1 : p2.date > p1.date ? -1 : 0
                        ),
                    });
                })
                .catch((err) => console.log(err));
        });
};
