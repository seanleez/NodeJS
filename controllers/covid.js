const Employee = require('../models/employee');
const Covid = require('../models/covid');
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

                    console.log('Display Covid Infor.');
                    res.render('covid/covidinfo', {
                        pageTitle: 'Covid Information',
                        employee: req.user,
                        covidInfor: covidInformation,
                        bodyTempratureInfor: bodyTempratureInfor,
                        isAuthenticated: req.session.isLoggedIn,
                    });
                }
            );
        })
        .catch((err) => console.log(err));
};

exports.getCovidRegistration = (req, res, next) => {
    res.render('covid/covidregistration', {
        pageTitle: 'Covid Registration Form',
        employee: req.user,
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.postCovidRegistration = (req, res, next) => {
    const vaccineShot1 = req.body.vaccineShot1;
    const dateShot1 = req.body.dateShot1;
    const vaccineShot2 = req.body.vaccineShot2;
    const dateShot2 = req.body.dateShot2;
    const bodyTemprature = req.body.bodyTemprature;

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
                const negative = req.body.negative ? true : false;
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
        .catch((err) => console.log(err));
};
