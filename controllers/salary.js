const PunchData = require('../models/punchdata');

var monthSalary;

exports.getSalary = (req, res, next) => {
    let hasPunchData = false;
    PunchData.find({
        employee_id: req.user._id,
    })
        .then((punchdatas) => {
            const salaryScale = req.user.salaryScale;
            let totalOverTimeInMonth = 0;

            for (const p of punchdatas) {
                if (p.date.getMonth() + 1 === Number(monthSalary)) {
                    hasPunchData = true;
                    totalOverTimeInMonth += p.overTime;
                }
            }

            const calculatedSalary =
                salaryScale * 3000000 + (totalOverTimeInMonth / 60) * 2000000;

            console.log('Display Salary Inforation.');
            res.render('salary/salary', {
                pageTitle: 'Salary',
                hasPunchData: hasPunchData,
                monthSalary: monthSalary,
                salaryScale: salaryScale,
                overTime: totalOverTimeInMonth,
                salary: calculatedSalary,
                employee: req.user,
            });
        })
        .catch((err) => console.log(err));
};

exports.postSalary = (req, res, next) => {
    monthSalary = req.body.monthSalary;
    res.redirect('/salary');
};

exports.getWorkingTime = (req, res, next) => {
    PunchData.find({
        employee_id: req.user._id,
    })
        .then((punchdatas) => {
            console.log('Display Working Time Inforation.');
            res.render('salary/workingtime', {
                pageTitle: 'Working Time',
                employee: req.user,
                punchDatas: punchdatas.sort((p1, p2) =>
                    p1.date > p2.date ? 1 : p2.date > p1.date ? -1 : 0
                ),
            });
        })
        .catch((err) => console.log(err));
};
