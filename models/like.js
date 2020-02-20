const mongoose = require('mongoose');
const { Schema } = mongoose;


const likeSchema = new Schema(
    {
        /**  Id of a product | help-request | requirement | interview | goal | design | howtodoc | testing | event */
        referenceId: {
            type: Schema.Types.ObjectId
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            // required: true
        },
        type: {
            type: String,
            enum: ['user', 'product', 'help-request', 'requirement', 'interview', 'testing', 'design', 'howtodoc', 'goal', 'event', 'team-skill', 'dream-job', 'job', 'career-coach', 'business-coach', 'capital-funding', 'hiring-process',
            'sales-challenge',        /** company post type */
            'marketing-challenge',    /** company post type */
            'technical-challenge',    /** company post type */
            'business-challenge',     /** company post type */
            'team-challenge',         /** company post type */
            'sales-goal',             /** company post type */
            'marketing-goal',         /** company post type */
            'technical-goal',         /** company post type */
            'business-goal',          /** company post type */
            'team-goal',              /** company post type */
            'mission',                /** company post type */
            'company-post',           /** company post type */
            'company-template',       /** company post type */
            'company-profile',         /** company post type */
            'competitive-advantage'   /** company post type */
            ],
        },
    },
    {
        timestamps: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('like');
    } catch (e) {
        return mongoose.model('like', likeSchema);
    }
};
