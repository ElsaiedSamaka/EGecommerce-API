const express = require("express");
const router = express.Router();
const csrf = require("csurf");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const UserController = require("../controllers/User.Controller");
const Order = require("../models/Order.model");
const middleware = require("../middleware");
const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../config/validator");
const User = require("../models/User.model");
const csrfProtection = csrf();
// TODO: need setup with client
router.use(csrfProtection);

// GET: display the signup form with csrf token
// TODO: setup <input type="hidden" name="csurf" value={{csrfToken}} />
router.get("/signup", middleware.isNotLoggedIn, UserController.getSignUpForm);

// POST: handle the signup logic
router.post(
  "/signup",
  [
    middleware.isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignup,
    // passport.authenticate("local.signup", {
    //   successRedirect: "/user/profile",
    //   failureRedirect: "/user/signup",
    //   failureFlash: true,
    // }),
  ],
  UserController.signUp
);

// GET: display the signin form with csrf token
router.get("/signin", middleware.isNotLoggedIn, UserController.getSignInForm);

// POST: handle the signin logic
router.post(
  "/signin",
  [
    middleware.isNotLoggedIn,
    userSignInValidationRules(),
    validateSignin,
    // passport.authenticate("local.signin", {
    //   failureRedirect: "/user/signin",
    //   failureFlash: true,
    // }),
  ],
  UserController.signIn
);

// GET: display user's profile
router.get("/profile", middleware.isLoggedIn, async (req, res) => {
  try {
    // find all orders of this user
    allOrders = await Order.find({ user: req.user });
    user = await User.find({ email: req.user.email });
    await res.json({
      orders: allOrders,
      user: user,
      pageName: "User Profile",
    });
  } catch (err) {
    console.log(err);
    return await res.json({ err });
  }
});

// GET: display all users
router.get("/all", async (req, res) => {
  try {
    // find all orders of this user
    allUsers = await User.find({});
    await res.json({
      users: allUsers,
      pageName: "Users",
    });
  } catch (err) {
    console.log(err);
    return await res.json({ err });
  }
});

// GET: logout
router.get("/logout", middleware.isLoggedIn, UserController.logOut);
module.exports = router;
