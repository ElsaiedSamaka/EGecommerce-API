var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const Cart = require("../models/Cart.model");
const User = require("../models/User.model");

// GET: display the signup form with csrf token
// TODO: setup <input type="hidden" name="csurf" value={{csrfToken}} />
const getSignUpForm = async (req, res) => {
  await res.json({
    csrfToken: req.csrfToken(),
    pageName: "Sign Up",
  });
};

// POST: handle the signup logic
const signUp = async (req, res) => {
  const { body } = req;
  //post new user
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      res.json({ message: "Email already exists" });
    } else {
      const { username, email, password, permissionLevel } = body;
      const newUser = await new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = newUser.encryptPassword(password);
      await newUser.save();
      await res.json({ newUser });
    }
  } catch (err) {
    await res.json({ err });
  }
  // try {
  //   //if there is cart session, save it to the user's cart in db
  //   if (req.session.cart) {
  //     const cart = await new Cart(req.session.cart);
  //     cart.user = req.user._id;
  //     await cart.save();
  //   }
  //   // redirect to the previous URL
  //   if (req.session.oldUrl) {
  //     let oldUrl = req.session.oldUrl;
  //     req.session.oldUrl = null;
  //     // res.redirect(oldUrl);
  //     res.send(oldUrl);
  //   } else {
  //     res.send("/user/profile");
  //     //   res.redirect("/user/profile");
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return res.send("/");
  // }
};

// GET: display the signin form with csrf token
const getSignInForm = async (req, res) => {
  await res.json({
    csrfToken: req.csrfToken(),
    pageName: "Sign In",
  });
};

// POST: handle the signin logic
const signIn = async (req, res) => {
  const { body } = req;
  let { email } = body;
  // sign in user
  const user = await User.findOne({ email: email });
  if (!user) {
    res.json({ message: "User doesn't exist" });
  }
  if (!user.validPassword(password)) {
    res.json({ message: "Wrong password" });
  }
  // try {
  //   // cart logic when the user logs in
  //   let cart = await Cart.findOne({ user: req.user._id });
  //   // if there is a cart session and user has no cart, save it to the user's cart in db
  //   if (req.session.cart && !cart) {
  //     const cart = await new Cart(req.session.cart);
  //     cart.user = req.user._id;
  //     await cart.save();
  //   }
  //   // if user has a cart in db, load it to session
  //   if (cart) {
  //     req.session.cart = cart;
  //   }
  //   // redirect to old URL before signing in
  //   if (req.session.oldUrl) {
  //     var oldUrl = req.session.oldUrl;
  //     req.session.oldUrl = null;
  //     res.send(oldUrl);
  //   } else {
  //     res.send("/user/profile");
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return res.josn({ err });
  // }
};

// GET: logout
const logOut = async (req, res) => {
  await req.logout();
  req.session.cart = null;
  await res.send("/");
};
module.exports = {
  getSignUpForm,
  signUp,
  getSignInForm,
  signIn,
  logOut,
};
