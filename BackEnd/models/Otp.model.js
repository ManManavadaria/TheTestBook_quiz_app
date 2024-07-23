// const otpSchema = new mongoose.Schema({
//     user: {
//       type: mongoose.Schema.Types.userId,
//       ref: 'User',
//       required: true,
//     },
//     otp: {
//       type: String,
//       required: true,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//       index: { expires: '5m' }, // TTL index to auto-delete OTP after 5 minutes
//     },
//   });
  
//   const OTP = mongoose.model('OTP', otpSchema);
  
//   module.exports = OTP;
  