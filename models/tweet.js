const mongoose = require('mongoose');
const { Schema } = mongoose;


const tweetSchema = new Schema(
    {
        /** createdBy is a reference to user, we only save user's Id */
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        /** Only 2 values are accepted. either "Created" or "Deleted" */
        status: {
            type: String,
            enum: ['Created', 'Deleted'],
            default: 'Created'
        },
        description: [Schema.Types.Mixed],
    },

    /** Setting timestamps true, will automatically create the 2 fields, createdAt & updatedAt 
     * so, whenever any tweet will be created or updated, those 2 fields willbe maintend automatically
     */
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('tweet');
    } catch (e) {
        return mongoose.model('tweet', tweetSchema);
    }
};
