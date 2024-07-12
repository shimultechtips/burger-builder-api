const PaymentSession = require("ssl-commerz-node").PaymentSession;
const { Order } = require("../models/order");
const { Payment } = require("../models/payment");
const path = require("node:path");
const axios = require("axios");

module.exports.ipn = async (req, res) => {
  if (req.body.status === "VALID") {
    const val_id = req.body.val_id;
    const store_id = process.env.STORE_ID;
    const store_passwd = process.env.STORE_PASSWORD;

    await axios
      .get(
        "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php",
        {
          params: {
            val_id: val_id,
            store_id: store_id,
            store_passwd: store_passwd,
          },
        }
      )
      .then(async (response) => {
        const payment = new Payment(req.body);
        const tran_id = payment["tran_id"];

        if (payment["status"] === "VALID") {
          const order = await Order.updateOne(
            { tran_id: tran_id },
            { status: "Paid" }
          );
        }
        try {
          await payment.save();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log("Validation Error : ", err);
      });
  } else {
    console.log("IPN Request Body Error : ", req.body.error);
  }

  return res.status(200).send("IPN");
};

module.exports.initPayment = async (req, res) => {
  const userId = req.user._id;
  const payOrder = await Order.findOne({
    userId: userId,
    _id: req.params.id,
  });

  const tran_id =
    "_" + Math.random().toString(36).substring(2, 9) + new Date().getTime();

  const payment = new PaymentSession(
    true,
    process.env.STORE_ID,
    process.env.STORE_PASSWORD
  );

  // Set the urls
  payment.setUrls({
    success: "https://burger-builder-api.vercel.app/api/payment/success", // If payment Succeed
    fail: "https://burger-builder-api.vercel.app/api/payment/fail", // If payment failed
    cancel: "https://burger-builder-api.vercel.app/api/payment/cancel", // If user cancel payment
    ipn: "https://burger-builder-api.vercel.app/api/payment/ipn", // SSLCommerz will send http post request in this link
  });

  // Set order details
  payment.setOrderInfo({
    total_amount: payOrder.price, // Number field
    currency: "BDT", // Must be three character string
    tran_id: tran_id, // Unique Transaction id
    emi_option: 0, // 1 or 0

    // multi_card_name: "internetbank", // Do not Use! If you do not customize the gateway list,
    // allowed_bin: "371598,371599,376947,376948,376949", // Do not Use! If you do not control on transaction
    // emi_max_inst_option: 3, // Max instalment Option
    // emi_allow_only: 0, // Value is 1/0, if value is 1 then only EMI transaction is possible
  });

  // Set customer info
  payment.setCusInfo({
    name: "N/A",
    email: req.user.email,
    add1: "N/A",
    add2: "N/A",
    city: "N/A",
    state: "N/A",
    postcode: "N/A",
    country: "N/A",
    phone: "N/A",
    fax: "N/A",
  });

  // Set shipping info
  payment.setShippingInfo({
    method: "Courier", //Shipping method of the order. Example: YES or NO or Courier
    num_item: 1,
    name: "N/A",
    add1: "N/A",
    add2: "N/A",
    city: "N/A",
    state: "N/A",
    postcode: "N/A",
    country: "N/A",
  });

  // Set Product Profile
  payment.setProductInfo({
    product_name: "Bohubrihi Burger Builder",
    product_category: "General",
    product_profile: "general",
  });

  response = await payment.paymentInit();

  if (response.status === "SUCCESS") {
    payOrder.tran_id = tran_id;

    try {
      await payOrder.save();
    } catch (err) {
      console.log(err);
    }
  }

  return res.status(200).send(response);
};

module.exports.makePrevPayment = async (req, res) => {
  const userId = req.user._id;
  const payOrder = await Order.findOne({
    userId: userId,
    _id: req.params.id,
  });

  const payment = new PaymentSession(
    true,
    process.env.STORE_ID,
    process.env.STORE_PASSWORD
  );

  // Set the urls
  payment.setUrls({
    success: "https://burger-builder-api.vercel.app/api/payment/success", // If payment Succeed
    fail: "https://burger-builder-api.vercel.app/api/payment/fail", // If payment failed
    cancel: "https://burger-builder-api.vercel.app/api/payment/cancel", // If user cancel payment
    ipn: "https://burger-builder-api.vercel.app/api/payment/ipn", // SSLCommerz will send http post request in this link
  });

  // Set order details
  payment.setOrderInfo({
    total_amount: payOrder.price, // Number field
    currency: "BDT", // Must be three character string
    tran_id: payOrder.tran_id, // Unique Transaction id
    emi_option: 0, // 1 or 0

    // multi_card_name: "internetbank", // Do not Use! If you do not customize the gateway list,
    // allowed_bin: "371598,371599,376947,376948,376949", // Do not Use! If you do not control on transaction
    // emi_max_inst_option: 3, // Max instalment Option
    // emi_allow_only: 0, // Value is 1/0, if value is 1 then only EMI transaction is possible
  });

  // Set customer info
  payment.setCusInfo({
    name: "N/A",
    email: req.user.email,
    add1: "N/A",
    add2: "N/A",
    city: "N/A",
    state: "N/A",
    postcode: "N/A",
    country: "N/A",
    phone: "N/A",
    fax: "N/A",
  });

  // Set shipping info
  payment.setShippingInfo({
    method: "Courier", //Shipping method of the order. Example: YES or NO or Courier
    num_item: 1,
    name: "N/A",
    add1: "N/A",
    add2: "N/A",
    city: "N/A",
    state: "N/A",
    postcode: "N/A",
    country: "N/A",
  });

  // Set Product Profile
  payment.setProductInfo({
    product_name: "Bohubrihi Burger Builder",
    product_category: "General",
    product_profile: "general",
  });

  response = await payment.paymentInit();

  return res.status(200).send(response);
};

module.exports.paymentSuccess = async (req, res) => {
  res.redirect("https://burger-builder-five-livid.vercel.app/success");
};

module.exports.paymentFail = async (req, res) => {
  res.redirect("https://burger-builder-five-livid.vercel.app/fail");
};

module.exports.paymentCancel = async (req, res) => {
  res.redirect("https://burger-builder-five-livid.vercel.app/cancel");
};

module.exports.getPayment = async (req, res) => {
  const payment = await Payment.findOne({ tran_id: req.params.id });
  res.status(200).send(payment);
};
