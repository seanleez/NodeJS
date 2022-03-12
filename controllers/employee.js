const Employee = require('../models/employee');
const PunchData = require('../models/punchdata');
const AnnualLeave = require('../models/annualleave');

const employeeId = '622c10eb5d3ae36d71eb16bc';
var punchDate;

exports.getEmployee = (req, res, next) => {
    // res.render('employee', { pageTitle: 'Employee'});
    // In case employees collection has one user
    Employee.findById(employeeId)
        .then((employee) => {
            console.log('Display Employee!');
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
        })
        .then(() => {
            PunchData.find({
                employee_id: employeeId,
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
                        employee: tempEmployee,
                        punchData: punchdata,
                    });
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postPunchIn = (req, res, next) => {
    console.log(req.body);

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
                // Add new Shift
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
                console.log('Add new Punchdata');
                return punchData.save();
            }
        })
        .then((result) => {
            console.log(result);
            res.redirect('/punch-in');
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getAnnualLeave = (req, res, next) => {
    Employee.findById(employeeId)
        .then((employee) => {
            console.log(employee);
            res.render('employee/annualleave', {
                pageTitle: 'Annual Leave',
                employee: employee,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postAnnualLeave = (req, res, next) => {
    const dayoff = req.body.dayoff;
    const reason = req.body.reason;
    const hourOff = req.body.hourOff ? req.body.hourOff : 8;

    // Minus annualLeave with commensurate hourOff
    Employee.findById(employeeId)
        .then((employee) => {
            employee.annualLeave -= hourOff;
            employee.save();
        })
        .catch((err) => console.log(err));

    const newAnnualLeave = new AnnualLeave({
        employee_id: employeeId,
        dayoff: dayoff,
        reason: reason,
        hourOff: hourOff,
    });

    newAnnualLeave
        .save()
        .then((result) => {
            console.log(result);
            res.redirect('/annualleave');
        })
        .catch((err) => console.log(err));
};

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
            console.log(req.body);
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
