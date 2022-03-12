const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const annualLeaveSchema = new Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        require: true,
    },
    dayoff: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    hourOff: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('AnnualLeave', annualLeaveSchema);
