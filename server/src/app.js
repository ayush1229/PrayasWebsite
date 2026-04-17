const express = require("express");
const cors = require("cors");
const path = require("path");
const router = require("./router");
const cookieParser = require("cookie-parser");
const globalService = require("./modules/global/global.service");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.locals.globalService = globalService;

// Serve financial PDFs — accessible at /files/financials/expenditure/ and /files/financials/donations/
app.use(
  "/files/financials",
  express.static(path.resolve(__dirname, "../financials"), {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    },
  })
);

app.use("/", router);

module.exports = app;
