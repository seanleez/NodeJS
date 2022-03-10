const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const punchDataSchema = new Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    date: {
        type: Date,
        require: true,
    },
    punch: {
        shift: [
            {
                workPlace: {
                    type: String,
                    required: true,
                },
                startTime: {
                    type: Date,
                    required: true,
                },
                finishTime: {
                    type: Date,
                },
                shiftWorkingTime: {
                    type: Number,
                },
            },
        ],
    },
    dailyWorkingTime: {
        type: Number,
        required: true,
    },
    overTime: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('PunchData', punchDataSchema);
