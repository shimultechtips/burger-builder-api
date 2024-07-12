const { Schema, model } = require("mongoose");

const orderSchema = {
  userId: Schema.Types.ObjectId,
  ingredients: [{ type: { type: String }, amount: Number }],
  customer: {
    deliveryAddress: String,
    phone: String,
    paymentType: String,
  },
  price: Number,
  tran_id: String,
  status: String,
  orderTime: { type: Date, default: Date.now },
};

module.exports.Order = model("Order", orderSchema);
