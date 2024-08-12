const mongoose = require('mongoose');
const { Schema } = mongoose;

const pendingSignInSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true }
});

pendingSignInSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });


const PendingSignIn = mongoose.model('PendingSignIn', pendingSignInSchema);

module.exports = PendingSignIn;
