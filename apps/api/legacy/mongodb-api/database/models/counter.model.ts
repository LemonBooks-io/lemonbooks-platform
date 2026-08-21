
import mongoose, { Schema } from "mongoose";
import { ICounter } from "../../interfaces/invoice.interface";

const CounterSchema = new Schema<ICounter>({
    businessId: { type: Schema.Types.ObjectId, required: true, ref: "businesses", index : true },
    name: { type: String, required: true, index : true},
    seq: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    id: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);
  
const Counter = mongoose.model<ICounter>("system_invoice_counter", CounterSchema);

export default Counter;