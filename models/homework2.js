const mongoose = require('mongoose');
const { Schema } = mongoose;


const homework2Schema = new Schema(
    {
        assignmentNo: String,
        title: String,
        detailDescription: String
    },
    {
        timestamps: true, 
    },
);



module.exports = () => {
    try {
        return mongoose.model('homework2');
    }
    catch (e) {
        return mongoose.model('homework2', homework2Schema);
    }
};
