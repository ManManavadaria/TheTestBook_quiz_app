const mongoose = require('mongoose');
const { Schema } = mongoose;

const pendingRegistrationSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    school: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    class: { type: String, required: true },
    accessLevel: { type: String, default: 'student' },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true }
});


pendingRegistrationSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

module.exports = PendingRegistration;
