const mongoose = require('mongoose');
const { Schema } = mongoose;

const homeworkSchema = new Schema(
    {
        assignmentNo: Number,
        title: String,
        detailDescription: String,
        demoUrl: String
    },
    {
        timestapms: true, 
    },
);

module.exports = () => {
    try {
        return mongoose.model('homework');
    }
    catch (e) {
        return mongoose.model('homework', homeworkSchema);
    }
};
