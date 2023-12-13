const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const array = [];
const calculateOrderAmount = (items) => {
  items.map((item) => {
    const { price, cartQuantity } = item;
    const itemAmount = price * cartQuantity;
    return array.push(itemAmount);
  });
  const totalAmount = array.reduce((a, b) => {
    return a + b;
  }, 0);

  return totalAmount * 100;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items, shipping, description } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    description,
    shipping: {
      address: {
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        country: shipping.country,
        postal_code: shipping.postal_code,
      },
      name: shipping.name,
      phone: shipping.phone,
    },
    // receipt_email: userEmail
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to eShopBLab!");
});

app.listen(process.env.PORT, () =>
  console.log(`Node server listening on port ${process.env.PORT}!`)
);
