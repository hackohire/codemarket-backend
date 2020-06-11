const mongoose = require('mongoose');
const { Schema } = mongoose;


const fileSchema = new Schema(
    {
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        
        status: {
            type: String,
            enum: ['Cleaning', 'Finished'],
            default: 'Cleaning'
        },
        name: String

    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('file');
    } catch (e) {
        return mongoose.model('file', fileSchema);
    }
};
