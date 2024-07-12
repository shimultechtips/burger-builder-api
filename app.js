const express = require("express");
const cors = require("cors"); // Cross Origin Resource Sharing. If Front-end And Back-end Are On Different Server Then It Wiil Access The Permission And Not Block Requests.
const compression = require("compression");
const userRouter = require("./routers/userRouter");
const orderRouter = require("./routers/orderRouter");
const morgan = require("morgan");
const paymentRouter = require("./routers/paymentRouter");

const app = express();

app.use(compression());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json()); // Converts Post Method Data To JSON Format
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter);
app.use("/order", orderRouter);
app.use("/api/payment", paymentRouter);

// app.use("/", (req, res) => res.send("Server Is Working!"));

module.exports = app;
