const router = require("express").Router();
const {
  initPayment,
  ipn,
  paymentSuccess,
  paymentCancel,
  paymentFail,
  getPayment,
  makePrevPayment,
} = require("../controllers/paymentControllers");
const authorize = require("../middlewares/authorize");

router.route("/:id").get(authorize, initPayment);
router.route("/prevorder/:id").get(authorize, makePrevPayment);
router.route("/get/:id").get(authorize, getPayment);
router.route("/ipn").post(ipn);
router.route("/success").post(paymentSuccess);
router.route("/fail").post(paymentFail);
router.route("/cancel").post(paymentCancel);

module.exports = router;
