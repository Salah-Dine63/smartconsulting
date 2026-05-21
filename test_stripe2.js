const Stripe = require('stripe');
const stripe = new Stripe('sk_test_dummy_key_please_replace_with_real_one');
async function run() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "usd", product_data: { name: "Test" }, unit_amount: 1000 }, quantity: 1 }],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    console.log("Session:", session);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
run();
