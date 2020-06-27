const connectToMongoDB = require('../helpers/db');
const helper = require('../helpers/helper');
const Booking = require('../models/booking')();
const User = require('../models/user')();
let conn;

const bookSession = async (_, { post, booking }) => {
    return new Promise(async (resolve, reject) => {
        try {

            conn = await connectToMongoDB();

            const filePath = basePath + 'email-template/common-template';
            const user = await User.findById(booking.createdBy).exec();
            const postCreator = await User.findById(post.createdBy).exec();
            let payLoadToAuthor, payLoadToUserWhoBooked, newBooking;

            switch (booking.status) {
                case 'BOOKED':
                    payLoadToAuthor = {
                        NAME: postCreator.name,

                        HTML_CONTENT: `<p><a href="${process.env.FRONT_END_URL}user/${user.slug}">${user.name}</a> has booked <strong>15 min</strong> session with you regarding <a href="${process.env.FRONT_END_URL}post/${post.slug}">${post.name}</a> on <strong>${booking.date} ${booking.duration[0]}-${booking.duration[1]}</strong></p>`,

                        SUBJECT: `15 Minutes Call`
                    };
                    await helper.sendEmail(postCreator.email, filePath, payLoadToAuthor);

                    payLoadToUserWhoBooked = {
                        NAME: user.name,

                        HTML_CONTENT: `<p> You have successfully booked <strong>15 Min</strong> session with <a href="${process.env.FRONT_END_URL}user/${postCreator.slug}">${postCreator.name}</a> regarding <a href="${process.env.FRONT_END_URL}post/${post.slug}">${post.name}</a> on <strong>${booking.date} ${booking.duration[0]}-${booking.duration[1]}</strong></p>`,

                        SUBJECT: `15 Minutes Call`
                    }
                    await helper.sendEmail(user.email, filePath, payLoadToUserWhoBooked);

                    newBooking = new Booking(booking);

                    return resolve((await newBooking.save()).toJSON());
            }


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    bookSession
}