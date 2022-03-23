const PunchData = require('../models/punchdata');

const PUNCHDATA_PER_PAGE = 2;
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
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postSalary = (req, res, next) => {
    monthSalary = req.body.monthSalary;
    res.redirect('/salary');
};

exports.getWorkingTime = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalPunchdatas;
    PunchData.find({ employee_id: req.user._id })
        .countDocuments()
        .then((numPunchdatas) => {
            totalPunchdatas = numPunchdatas;
            console.log(totalPunchdatas);
            return PunchData.find({ employee_id: req.user._id })
                .sort({ date: 1 })
                .skip((page - 1) * PUNCHDATA_PER_PAGE)
                .limit(PUNCHDATA_PER_PAGE);
        })
        .then((punchdatas) => {
            console.log('Display Working Time Information.');
            res.render('salary/workingtime', {
                pageTitle: 'Working Time',
                employee: req.user,
                punchDatas: punchdatas,
                hasPunchData: totalPunchdatas > 0 ? true : false,
                currentPage: page,
                hasNextPage: PUNCHDATA_PER_PAGE * page < totalPunchdatas,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalPunchdatas / PUNCHDATA_PER_PAGE),
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
