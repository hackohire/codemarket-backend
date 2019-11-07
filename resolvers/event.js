const connectToMongoDB = require('../helpers/db');
const Post = require('../models/post')();
const helper = require('../helpers/helper');
const Subscription = require('../models/subscription')();
var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
let conn;


async function rsvpEvent(_, { userId, eventId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            console.log(decodedToken);

            /** Find if user has subscription */
            const sub = await Subscription.findOne({
                $or: [
                    { "metadata.userId": { $eq: ObjectID(userId)}, status: { $ne: 'canceled' }},
                    { 'subscriptionUsers.email': decodedToken.email, status: { $ne: 'canceled' }}
                ]
            });
            let validSubscription = false;
            let updatedPostWithAttendees;


            /** Check if subscription is valid or not */
            if (sub) {
                validSubscription = moment(moment()).isBefore(sub.current_period_end * 1000, "YYYY/MM/DD");
            }

            /** If valid subscription, add the user in the list of attendees */
            if (validSubscription) {
                updatedPostWithAttendees = await Post.findOneAndUpdate({ _id: eventId }, { $push: { usersAttending: userId } }, { new: true })
                    .populate({ path: 'usersAttending' }).exec();
            }

            if (updatedPostWithAttendees) {
                /** Send Email on Successful RSVP */
                const filePath = basePath + 'email-template/rsvpSuccessful';
                var eventLink = process.env.FRONT_END_URL + `(main:dashboard/${updatedPostWithAttendees.type === 'product' ? 'product' : 'post'}/${updatedPostWithAttendees.slug})?type=${updatedPostWithAttendees.type}`;
                var attendee = updatedPostWithAttendees.usersAttending.find(u => u.id === userId);
                const payLoad = {
                    ATTENDEE: attendee.name,
                    EVENT_NAME: updatedPostWithAttendees.name,
                    EVENTLINK: eventLink,
                    FROM: moment(updatedPostWithAttendees.dateRange[0]).format('dddd MMMM Do YYYY, h:mm a'),
                    TO: moment(updatedPostWithAttendees.dateRange[1]).format('dddd MMMM Do YYYY, h:mm a'),
                    ADDRESS: updatedPostWithAttendees.address ?  updatedPostWithAttendees.address : ''
                };
                await helper.sendEmail(attendee.email, filePath, payLoad);
                return resolve({ usersAttending: updatedPostWithAttendees.usersAttending, validSubscription });
            } else {
                return resolve({ validSubscription })
            }
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function cancelRSVP(_, { userId, eventId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            /** We are findin the event from which we want to reove the user as the attendee and updating the event by removing the user 
             * and returning the event with updated usersAttending 
            */
            const updatedRSVP = await Post.findOneAndUpdate({type: 'event', _id: eventId }, { $pull: { usersAttending: { $in: [ userId ] }}}, { new: true })
                .populate({ path: 'usersAttending' }).exec();

            return resolve(updatedRSVP)

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function myRSVP(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const myRSVPEvents = await Post.find({type: 'event', 'usersAttending': { $in: [userId] } })
                .populate({ path: 'createdBy' }).exec();

            return resolve(myRSVPEvents)

        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    rsvpEvent,
    myRSVP,
    cancelRSVP
}