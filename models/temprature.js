const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TempratureSchema = new Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    bodyTemprature: {
        type: Number,
        required: true,
    },
    negative: {
        type: Boolean,
        required: true,
    },
});

module.exports = mongoose.model('Temprature', TempratureSchema);
