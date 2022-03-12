const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CovidSchema = new Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    vaccineShot1: {
        type: String,
        required: true,
    },
    dateShot1: {
        type: Date,
        required: true,
    },
    vaccineShot2: {
        type: String,
        required: true,
    },
    dateShot2: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('Covid', CovidSchema);
