import mongoose, { Model, Schema } from "mongoose";
import { IOtp } from "../../interfaces/token.interface";

const schema = new Schema<IOtp>({
  token: {
    type: String,
    required: true,
    maxlength: 6,
    index: true, // Added index to token field, for faster lookups
  },
  userId: {
    type: String,
    require: true,
  },
  expiryInSecs: {
    type: Date,
    default: Date.now,
    index: {
      expires: 900, // document expires in 15mins
    },
  },
});

const OTP: Model<IOtp> = mongoose.model("otp", schema);

export default OTP;
