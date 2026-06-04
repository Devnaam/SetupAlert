const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId) {
  throw new Error('Missing RAZORPAY_KEY_ID environment variable');
}

if (!keySecret) {
  throw new Error('Missing RAZORPAY_KEY_SECRET environment variable');
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
