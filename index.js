const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config()
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const Category = require("./models/Category.model");
let MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");
const { swaggerDocs } = require("./utils/swagger");

const app = express();
require("./config/passport");

// mongodb configuration
connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
    //session expires after 3 hours
    cookie: { maxAge: 60 * 1000 * 60 * 3 },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// global variables across routes
app.use(async (req, res, next) => {
  try {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    next();
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//routes config
const indexRouter = require("./routes/index.route");
const productsRouter = require("./routes/products.route");
const categoriesRouter = require("./routes/categories.route");
const usersRouter = require("./routes/user.route");
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/user", usersRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({err});
});

var port = process.env.PORT || 3000;
app.set("port", port);
app.listen(port, () => {
  console.log("Server running at port " + port);
  //TODO: setup swagger
  swaggerDocs(app, port);
});

module.exports = app;
