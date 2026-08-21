import mongoose, { Model, Schema } from "mongoose";
import { ICategory } from "../../interfaces/categories.interface";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required : true,
    },
    businessId : {
      type : String,
      required : true,
      ref : 'businesses'
    },
    description : {
      type : String,
    }
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


const Category: Model<ICategory> = mongoose.model("category", categorySchema);

export default Category;
