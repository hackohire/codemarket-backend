const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug, { truncate: 0 });

const { Schema } = mongoose;

const fieldSchema = new Schema(
    {
        name: String,
        label: String,
        type: String,
        
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
    },
    {
        timestamps: true,
        id: true,
    },
);

module.exports = () => {
    try {
        return mongoose.model('field');
    } catch (e) {
        return mongoose.model('field', fieldSchema);
    }

};