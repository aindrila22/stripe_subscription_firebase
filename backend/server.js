require("dotenv").config()
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json")
const express = require("express");
const app = express()
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");
const port = 5000

app.use(express.json())
app.use(bodyParser.json())

const [basic, pro, business] = 
['price_1NR9KHSI3ANpgzrSB37eQwwd', 'price_1NR9LTSI3ANpgzrSHjUbURWg', 'price_1NR9MHSI3ANpgzrSikIVEg6W'];

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://stripe-subscription-2f4de-default-rtdb.firebaseio.com"
  });
  

app.use(
    cors({
        origin:"http://localhost:5173"
    })
)

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


/*********** create subscription ************/

const stripeSession = async(plan) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: plan,
                    quantity: 1
                },
            ],
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel"
        });
        return session;
    }catch (e){
        return e;
    }
};

app.post("/api/v1/create-subscription-checkout-session", async(req, res) => {
    const {plan, customerId} = req.body;
    let planId = null;
    if(plan == 99) planId = basic;
    else if(plan == 499) planId = pro;
    else if(plan == 999) planId = business;

    try{

        const session = await stripeSession(planId);
        const user = await admin.auth().getUser(customerId);

        await admin.database().ref("users").child(user.uid).update({
            subscription: {
                sessionId: session.id
            }
        });
        return res.json({session})

    }catch(error){
        res.send(error)
    }
})

/************ payment success ********/

app.post("/api/v1/payment-success", async (req, res) => {
    const { sessionId, firebaseId } = req.body;
  
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
  
      if (session.payment_status === 'paid') {
          const subscriptionId = session.subscription;
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const user = await admin.auth().getUser(firebaseId);
            const planId = subscription.plan.id;
            const planType = subscription.plan.amount === 50000 ? "basic" : "pro";
            const startDate = moment.unix(subscription.current_period_start).format('YYYY-MM-DD');
            const endDate = moment.unix(subscription.current_period_end).format('YYYY-MM-DD');
            const durationInSeconds = subscription.current_period_end - subscription.current_period_start;
            const durationInDays = moment.duration(durationInSeconds, 'seconds').asDays();
            await admin.database().ref("users").child(user.uid).update({ 
                subscription: {
                  sessionId: null,
                  planId:planId,
                  planType: planType,
                  planStartDate: startDate,
                  planEndDate: endDate,
                  planDuration: durationInDays
                }});
  
              
            } catch (error) {
              console.error('Error retrieving subscription:', error);
            }
          return res.json({ message: "Payment successful" });
        } else {
          return res.json({ message: "Payment failed" });
        }
      } catch (error) {
        res.send(error);
      }
    });
  
         
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
})