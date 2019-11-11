const connectToMongoDB = require('../helpers/db');
const Product = require('../models/product')();
const Post = require('../models/post')();
const Booking = require('../models/booking')();
const helper = require('../helpers/helper');
const User = require('./../models/user')();
let conn;

async function scheduleCall(_, { booking }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const int = await new Booking(booking);
            await int.save(booking).then(async (p) => {
                console.log(p)

                p.populate('createdBy').populate('expert').populate('referenceId')
                    .execPopulate().then(async populatedBooking => {
                        // await helper.sendPostCreationEmail(populatedPost, populatedPost.type === 'product' ? 'Bugfix' : '');
                        resolve(populatedBooking);
                    });

            });


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

async function getBookingList(_, { userId }, { headers, db, decodedToken }) {
    return new Promise(async (resolve, reject) => {
        try {

            if (!db) {
                console.log('Creating new mongoose connection.');
                conn = await connectToMongoDB();
            } else {
                console.log('Using existing mongoose connection.');
            }

            const bookingList = await Booking.find().or([{createdBy: userId}, {expert: userId}])
            .populate('createdBy').populate('expert').populate('referenceId').exec();

            resolve(bookingList);


        } catch (e) {
            console.log(e);
            return reject(e);
        }
    });
}

module.exports = {
    scheduleCall,
    getBookingList
}