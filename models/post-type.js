const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const { Schema } = mongoose;

const postTypeSchema = new Schema(
    {
        name: String,
        label: String,
        type: { type: String, slug: ['name'] },
        description: [new Schema({
            type: String,
            data: Schema.Types.Mixed,
        })],
        fields: [{
            field: {
                type: Schema.Types.ObjectId,
                ref: "field",
            },
            selected: Boolean,
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        status: {
            type: String,
            enum: ['Created', 'Drafted', 'Published', 'Unpublished', 'Submitted', 'Approved', 'Rejected', 'Archieved', 'Deleted'],
            default: 'Created'
        },
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('posttype');
    } catch (e) {
        return mongoose.model('posttype', postTypeSchema);
    }

};