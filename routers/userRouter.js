const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");

const router = express.Router();

const newUser = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User Already Registered!");

  //   user = new User({
  //     email: req.body.email,
  //     password: req.body.password,
  //   });

  user = new User(_.pick(req.body, ["email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const token = user.generateJWT();

  const result = await user.save();

  return res.status(201).send({
    token: token,
    user: _.pick(result, ["_id", "email"]),
  });
};

const authUser = async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid Email Or Password!");

  const validUser = await bcrypt.compare(req.body.password, user.password);
  if (!validUser) return res.status(400).send("Invalid Email Or Password!");

  const token = user.generateJWT();
  res.send({
    token: token,
    user: _.pick(user, ["_id", "email"]),
  });
};

// router.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

router
  .route("/")
  .post(newUser)
  .get((req, res) => res.send("/user route!"));

router
  .route("/auth")
  .post(authUser)
  .get((req, res) => res.send("/user/auth route!"));

module.exports = router;
