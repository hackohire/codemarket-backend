const mongoose = require('mongoose');
const { Schema } = mongoose;


const contactSchema = new Schema(
    {
        companies: [{
            type: Schema.Types.ObjectId,
            ref: "company",
        }],
        status: String,
        email: String,
        name: String,
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        }
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('cartitem');
    } catch (e) {
        return mongoose.model('cartitem', contactSchema);
    }
};
