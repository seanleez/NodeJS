const { validationResult } = require('express-validator/check');

const Employee = require('../models/employee');
const PunchData = require('../models/punchdata');
const AnnualLeave = require('../models/annualleave');

const PUNCHDATA_PER_PAGE = 2;
var punchDate;

exports.getEmployee = (req, res, next) => {
    console.log('Display Employee.');
    res.render('employee', {
        pageTitle: 'Employee',
        employee: req.user,
        isManager: req.user.username.includes('manager') ? true : false,
        errorMessage: '',
        oldInput: { date: '' },
        validationErrors: [],
    });
};

exports.getPunchIn = (req, res, next) => {
    PunchData.find({
        employee_id: req.user._id,
    })
        .then((punchdatas) => {
            for (let punchdata of punchdatas) {
                if (
                    punchdata.date.toLocaleDateString('vi-VN') ===
                    punchDate.toLocaleDateString('vi-VN')
                ) {
                    return punchdata;
                }
            }
        })
        .then((punchdata) => {
            res.render('employee/punchin', {
                pageTitle: 'Punch In',
                employee: req.user,
                isManager: req.user.username.includes('manager') ? true : false,
                punchData: punchdata,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postPunchIn = (req, res, next) => {
    const employeeId = req.user._id;
    const workPlace = req.body.workPlace;
    const startHour = req.body.startHour;
    const startMinute = req.body.startMinute;
    const finishHour = req.body.finishHour;
    const finishMinute = req.body.finishMinute;

    let dateStartShift = new Date(req.body.date);
    dateStartShift.setHours(startHour);
    dateStartShift.setMinutes(startMinute);
    let dateFinishShift = new Date(req.body.date);
    dateFinishShift.setHours(finishHour);
    dateFinishShift.setMinutes(finishMinute);

    let calculateWorkingTime =
        Math.abs(dateFinishShift - dateStartShift) / (60 * 1000);

    punchDate = dateStartShift;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('employee', {
            pageTitle: 'Employee',
            employee: req.user,
            isManager: req.user.username.includes('manager') ? true : false,
            errorMessage: errors.array()[0].msg,
            oldInput: { date: req.body.date },
            validationErrors: errors.array(),
        });
    }

    PunchData.find()
        .then((punchdatas) => {
            // find punchdata where employee_id = employeeId and punchdata.date = punchDate
            // if punchDataIndex >= 0 then add newShift (register new shift in a day)
            // else add new PunchData (register new day)
            const punchDataIndex = punchdatas.findIndex((pd) => {
                return (
                    pd.employee_id.toString() === employeeId.toString() &&
                    pd.date.toLocaleDateString('vi-VN') ===
                        punchDate.toLocaleDateString('vi-VN')
                );
            });
            // console.log(punchDataIndex);
            if (punchDataIndex >= 0) {
                // Add new Shift in existed Day
                const newShift = [...punchdatas[punchDataIndex].punch.shift];

                newShift.push({
                    workPlace: workPlace,
                    startTime: dateStartShift,
                    finishTime: dateFinishShift,
                    shiftWorkingTime: calculateWorkingTime,
                });
                const updatedPunch = {
                    shift: newShift,
                };
                punchdatas[punchDataIndex].punch = updatedPunch;
                punchdatas[punchDataIndex].dailyWorkingTime +=
                    calculateWorkingTime;
                punchdatas[punchDataIndex].overTime += calculateWorkingTime;
                console.log('Add new shift for existed day');
                return punchdatas[punchDataIndex].save();
            } else {
                // Add new day
                const punchData = new PunchData({
                    employee_id: employeeId,
                    date: punchDate,
                    punch: {
                        shift: [
                            {
                                workPlace: workPlace,
                                startTime: dateStartShift,
                                finishTime: dateFinishShift,
                                shiftWorkingTime: calculateWorkingTime,
                            },
                        ],
                    },
                    dailyWorkingTime: calculateWorkingTime,
                    overTime: calculateWorkingTime - 8 * 60,
                });
                console.log('Add shift for new day');
                return punchData.save();
            }
        })
        .then((result) => {
            res.redirect('/punch-in');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAnnualLeave = (req, res, next) => {
    res.render('employee/annualleave', {
        pageTitle: 'Annual Leave',
        employee: req.user,
        isManager: req.user.username.includes('manager') ? true : false,
        errorMessage: '',
        oldInput: { dayoff: '', reason: '', hourOff: '' },
        validationErrors: [],
    });
};

exports.postAnnualLeave = (req, res, next) => {
    const employeeId = req.user._id;
    const dayoff = req.body.dayoff;
    const reason = req.body.reason;
    const hourOff = req.body.hourOff ? req.body.hourOff : 8;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('employee/annualleave', {
            pageTitle: 'Annual Leave',
            employee: req.user,
            isManager: req.user.username.includes('manager') ? true : false,
            errorMessage: errors.array()[0].msg,
            oldInput: { dayoff: dayoff, reason: reason, hourOff: hourOff },
            validationErrors: errors.array(),
        });
    }

    // Minus annualLeave hours with commensurate hourOff
    Employee.findById(employeeId)
        .then((employee) => {
            employee.annualLeave -= hourOff;
            employee.save();
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    const newAnnualLeave = new AnnualLeave({
        employee_id: employeeId,
        dayoff: dayoff,
        reason: reason,
        hourOff: hourOff,
    });

    console.log('Add new annual leave');
    newAnnualLeave
        .save()
        .then((result) => {
            res.redirect('/annualleave');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditInfo = (req, res, next) => {
    res.render('editinfo/editinfo', {
        pageTitle: 'Edit Info',
        employee: req.user,
        isManager: req.user.username.includes('manager') ? true : false,
        errorMessage: '',
    });
};

exports.postEditInfo = (req, res, next) => {
    const employeeId = req.user._id;
    const updatedImage = req.file;
    if (!updatedImage) {
        return res.status(422).render('editinfo/editinfo', {
            pageTitle: 'Edit Info',
            employee: req.user,
            isManager: req.user.username.includes('manager') ? true : false,
            errorMessage: 'Attach file is not an image',
        });
    }

    Employee.findById(employeeId)
        .then((employee) => {
            if (updatedImage) {
                employee.imageUrl = updatedImage.path;
            }
            employee.save();
        })
        .then((result) => {
            console.log('Updated Employee');
            res.redirect('/editinfo');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getManager = (req, res, next) => {
    Employee.find({ department: req.user.department })
        .then((employees) => {
            res.render('employee/manager', {
                pageTitle: 'Manager',
                employees: employees,
                isManager: req.user.username.includes('manager') ? true : false,
                errorMessage: '',
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getPunchData = (req, res, next) => {
    const employeeId = req.params.employeeId;
    const page = +req.query.page || 1;
    let totalPunchdatas;

    Employee.findById(employeeId)
        .then((employee) => {
            PunchData.find({ employee_id: employeeId })
                .countDocuments()
                .then((numPunchdatas) => {
                    totalPunchdatas = numPunchdatas;
                    console.log(totalPunchdatas);
                    return PunchData.find({ employee_id: employeeId })
                        .sort({ date: 1 })
                        .skip((page - 1) * PUNCHDATA_PER_PAGE)
                        .limit(PUNCHDATA_PER_PAGE);
                })
                .then((punchdatas) => {
                    console.log('Display Working Time Information.');
                    res.render('employee/punchdata', {
                        pageTitle: 'PunchData of Employee',
                        employee: employee,
                        isManager: req.user.username.includes('manager')
                            ? true
                            : false,
                        punchDatas: punchdatas,
                        errorMessage: '',
                        hasPunchData: totalPunchdatas > 0 ? true : false,
                        currentPage: page,
                        hasNextPage:
                            PUNCHDATA_PER_PAGE * page < totalPunchdatas,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(
                            totalPunchdatas / PUNCHDATA_PER_PAGE
                        ),
                    });
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postPunchData = (req, res, next) => {
    const employeeId = req.params.employeeId;
    const page = +req.query.page || 1;
    const date = req.body.date
    PunchData.deleteOne({employee_id: employeeId, date: date}).then(
        Employee.findById(employeeId)
        .then((employee) => {
            PunchData.find({ employee_id: employeeId })
                .countDocuments()
                .then((numPunchdatas) => {
                    totalPunchdatas = numPunchdatas;
                    console.log(totalPunchdatas);
                    return PunchData.find({ employee_id: employeeId })
                        .sort({ date: 1 })
                        .skip((page - 1) * PUNCHDATA_PER_PAGE)
                        .limit(PUNCHDATA_PER_PAGE);
                })
                .then((punchdatas) => {
                    console.log('Display Working Time Information.');
                    res.render('employee/punchdata', {
                        pageTitle: 'PunchData of Employee',
                        employee: employee,
                        isManager: req.user.username.includes('manager')
                            ? true
                            : false,
                        punchDatas: punchdatas,
                        errorMessage: '',
                        hasPunchData: totalPunchdatas > 0 ? true : false,
                        currentPage: page,
                        hasNextPage:
                            PUNCHDATA_PER_PAGE * page < totalPunchdatas,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(
                            totalPunchdatas / PUNCHDATA_PER_PAGE
                        ),
                    });
                });
        })
    ).catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}