
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const connectToDB = require('./helpers/db');

module.exports.checkoutSessionCompleted = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            // parse body
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }
            let conn = await connectToDB();

            const { session_id } = body;
            const session = await stripe.checkout.sessions.retrieve(session_id);

            return resolve({
                statusCode: 200,
                body: JSON.stringify({
                    session
                })
            });
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}

module.exports.createCheckoutSession = async (event, context) => {
    return new Promise(async (resolve, reject) => {
        try {

            /** parse body */ 
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }

            let session;

            stripe.checkout.sessions.create(body).then((d) => {
                session = d;
                return resolve({
                    statusCode: 200,
                    body: JSON.stringify({session})
                });
            })
            .catch((e) => {
                console.log(e);
                return reject(e);
            })
        } catch (e) {
            console.log(e);
            return reject(e);
        }
    })
}