const employee = {
    id: '30940394',
    name: 'John',
    doB: 20032009,
    salaryScale: 1.1,
    startDate: 20042017,
    department: 'HR',
    annualLeave: 200,
    imageUrl:
        'http://assets.htv.com.vn/Images/TAP%20CHI%20HTV/XEM%20GI%20HOM%20NAY/DUONG/TITANIC/LEO1.jpg',
};

const punchData = {
    employee_id: '30940394',
    date: 13092022,
    punch: [
        {
            workPlace: 'company',
            startTime: 8,
            finishTime: 12,
            workingTime: 4,
        },
        {
            workPlace: 'home',
            startTime: 13,
            finishTime: 17,
            workingTime: 4,
        },
        {
            workPlace: 'customer',
            startTime: 18,
            finishTime: 21,
            workingTime: 3,
        },
        {
            workPlace: 'customer',
            startTime: 18,
            finishTime: 21,
            workingTime: 3,
        },
    ],
    totalWorkingTime: 11,
    overTime: 3,
};

exports.getSalary = (req, res, next) => {
    res.render('salary/salary', {
        pageTitle: 'Salary',
        employee: employee,
        punchData: punchData,
    });
};

exports.postSalary = (req, res, next) => {
    console.log(req.body);
    res.redirect('/salary');
};

exports.getWorkingTime = (req, res, next) => {
    res.render('salary/workingtime', {
        pageTitle: 'Working Time',
        employee: employee,
        punchData: punchData,
    });
};
