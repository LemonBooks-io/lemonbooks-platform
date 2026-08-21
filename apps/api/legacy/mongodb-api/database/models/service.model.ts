// import mongoose, { Model, Schema } from "mongoose";
// import { IService } from "../../interfaces/service.interface";
// import { Currency } from "../../enums/service.enum";

// const schema = new Schema<IService>(
//   {
//     serviceName: {
//       type: String,
//       required : true,
//       unique : true,
//     },
//     serviceCode: {
//       type: String,
//       unique : true,
//       index : true
//     },
//     serviceDescription: {
//       type: String,
//       default : " "
//     },
//     serviceCost : {
//       type : Number,
//       required : true,
//       default : 0.0
//     },
//     serviceCostCurrency:{
//         type : String,
//         required : true,
//         enum : Object.keys(Currency),
//         default : Currency.KWD
//     },
//     serviceBillingCycle:{
//         type : String,
//         required : true,
//         default : "YEARLY"
//     },
//     serviceCycle:{
//         type : String,
//         required : true,
//         default : "MONTHLY"
//     },
//     minimumTenureDuration:{
//         type : Number,
//         required : true,
//         default : 12,
//     },
//     createdBy:{
//       type : String,
//       required : true
//     }
    
// },
//   {
//     timestamps: true,
//     versionKey: false,
//     id: true,
//     toJSON: {
//       virtuals: true,
//       transform: (_, ret: any) => {
//         delete ret._id;
//         return ret;
//       },
//     },
//   }
// );

// // Create a service code for each service..
// schema.pre("validate", function (next) {
//   if (this.isNew && !this.serviceCode) {
//     const formatted = this.serviceName.trim().replace(/\s+/g, "-");
//     this.serviceCode = `SVC-${formatted}`;
//   }
//   next();
// });


// const Service: Model<IService> = mongoose.model("services", schema);

// export default Service;
