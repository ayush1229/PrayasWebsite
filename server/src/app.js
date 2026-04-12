const express = require("express");
const cors = require("cors");
const router = require("./router");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", router);

module.exports = app;
