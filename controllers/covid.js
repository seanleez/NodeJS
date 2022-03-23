const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const { validationResult } = require('express-validator/check');
const Covid = require('../models/covid');
const Employee = require('../models/employee');
const Temprature = require('../models/temprature');

exports.getCovidInfo = (req, res, next) => {
    Covid.find({ employee_id: req.user._id })
        .then((covids) => {
            const covidInformation = covids[0];

            Temprature.find({ employee_id: req.user._id }).then(
                (tempratures) => {
                    // Choose the latest day of body temprature infor to display
                    const bodyTempratureInfor = tempratures.sort((p1, p2) =>
                        p1.date > p2.date ? 1 : p2.date > p1.date ? -1 : 0
                    )[tempratures.length - 1];

                    Employee.find({
                        department: req.user.department,
                        username: /manager/i,
                    }).then((employee) => {
                        const isManager = req.user.username.includes('manager');
                        const managerName = employee[0].name;
                        console.log('Display Covid Infor.');
                        res.render('covid/covidinfo', {
                            pageTitle: 'Covid Information',
                            employee: req.user,
                            covidInfor: covidInformation,
                            bodyTempratureInfor: bodyTempratureInfor,
                            isManager: isManager,
                            managerName: managerName,
                        });
                    });
                }
            );
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCovidRegistration = (req, res, next) => {
    res.render('covid/covidregistration', {
        pageTitle: 'Covid Registration Form',
        employee: req.user,
        errorMessage: '',
        oldInput: {
            vaccineShot1: '',
            dateShot1: '',
            vaccineShot2: '',
            dateShot2: '',
            bodyTemprature: '',
        },
        validationErrors: [],
    });
};

exports.postCovidRegistration = (req, res, next) => {
    const vaccineShot1 = req.body.vaccineShot1;
    const dateShot1 = req.body.dateShot1;
    const vaccineShot2 = req.body.vaccineShot2;
    const dateShot2 = req.body.dateShot2;
    const bodyTemprature = req.body.bodyTemprature;
    const negative = req.body.negative ? true : false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        console.log(dateShot1);
        return res.status(422).render('covid/covidregistration', {
            pageTitle: 'Covid Registration Form',
            employee: req.user,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                vaccineShot1: vaccineShot1,
                dateShot1: dateShot1,
                vaccineShot2: vaccineShot2,
                dateShot2: dateShot2,
                bodyTemprature: bodyTemprature,
            },
            validationErrors: errors.array(),
        });
    }

    Covid.find()
        .then((covids) => {
            // find whether already exist information of this employee or not,
            // return -1 if have not yet
            const covidIndex = covids.findIndex((cv) => {
                return cv.employee_id.toString() === req.user._id.toString();
            });
            if (covidIndex >= 0) {
                covids[covidIndex].vaccineShot1 = vaccineShot1;
                covids[covidIndex].dateShot1 = dateShot1;
                covids[covidIndex].vaccineShot2 = vaccineShot2;
                covids[covidIndex].dateShot2 = dateShot2;
                console.log('Override existing Covid record');
                return covids[covidIndex].save();
            } else {
                const covid = new Covid({
                    employee_id: req.user._id,
                    vaccineShot1: vaccineShot1,
                    dateShot1: dateShot1,
                    vaccineShot2: vaccineShot2,
                    dateShot2: dateShot2,
                });
                console.log('Add new Covid record');
                return covid.save();
            }
        })
        .then(() => {
            Temprature.find().then((tempratures) => {
                // find whether already exist body temprature information on this day
                // of this employee or not, return -1 if have not yet

                const currentDate = new Date();
                const tempratureIndex = tempratures.findIndex((tp) => {
                    return (
                        tp.employee_id.toString() === req.user._id.toString() &&
                        tp.date.toLocaleDateString('vi-VN') ===
                            currentDate.toLocaleDateString('vi-VN')
                    );
                });
                if (tempratureIndex >= 0) {
                    tempratures[tempratureIndex].date = currentDate;
                    tempratures[tempratureIndex].bodyTemprature =
                        bodyTemprature;
                    tempratures[tempratureIndex].negative = negative;

                    console.log('Override existing Temprature record');
                    return tempratures[tempratureIndex].save();
                } else {
                    const temprature = new Temprature({
                        employee_id: req.user._id,
                        date: currentDate,
                        bodyTemprature: bodyTemprature,
                        negative: negative,
                    });

                    console.log('Add new Temprature record');
                    return temprature.save();
                }
            });
        })
        .then((result) => {
            res.redirect('/covidinfo');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getSeeEmployeesInfor = (req, res, next) => {
    Employee.find({ department: req.user.department })
        .then((employees) => {
            res.render('covid/seeemployeesinfor', {
                pageTitle: 'Employees Covid Information',
                employees: employees,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCovidInformation = (req, res, next) => {
    const employeeId = req.params.employeeId;
    const covidInformationName = 'covidinformation-' + employeeId + '.pdf';
    const covidInformationPath = path.join(
        'data',
        'covidinformation',
        covidInformationName
    );
    Employee.findById(employeeId)
        .then((employee) => {
            Covid.find({ employee_id: employeeId }).then((covids) => {
                Temprature.find({ employee_id: employeeId }).then(
                    (tempratures) => {
                        const pdfDoc = new PDFDocument();
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader(
                            'Content-Disposition',
                            'inline: filename="' + covidInformationName + '"'
                        );
                        pdfDoc.pipe(fs.createWriteStream(covidInformationPath));
                        pdfDoc.pipe(res);
                        pdfDoc.font('Times-Roman').fillColor('red');
                        pdfDoc.fontSize(26).text('Covid Information', {
                            bold: true,
                            underline: true,
                            align: 'center',
                        });

                        pdfDoc
                            .fontSize(23)
                            .text(employee.name, { align: 'center' });

                        pdfDoc.fillColor('black');
                        pdfDoc.fontSize(18).text('*Basic Information:');
                        pdfDoc.fontSize(15);
                        pdfDoc.text(
                            'Vaccine Shot 1: ' + covids[0].vaccineShot1,
                            100,
                            150
                        );
                        pdfDoc.text(
                            'Date Shot 1: ' +
                                covids[0].dateShot1.toLocaleDateString('vi-VN')
                        );
                        pdfDoc.text(
                            'Vaccine Shot 2: ' + covids[0].vaccineShot2
                        );
                        pdfDoc.text(
                            'Date Shot 2: ' +
                                covids[0].dateShot2.toLocaleDateString('vi-VN')
                        );

                        pdfDoc
                            .fontSize(18)
                            .text('*Body Temprature Register:', 75, 230);
                        pdfDoc.fontSize(15);
                        pdfDoc.text(
                            'Temprature: ' + tempratures[0].bodyTemprature,
                            100,
                            260
                        );
                        pdfDoc.text(
                            'Date: ' +
                                tempratures[0].date.toLocaleDateString(
                                    'vi-VN'
                                ) +
                                '   Time: ' +
                                tempratures[0].date.toString().slice(16, 24)
                        );
                        pdfDoc.text(
                            'Negative: ' +
                                (tempratures[0].negative ? 'Yes' : 'No')
                        );
                        pdfDoc.end();
                    }
                );
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
