const express = require("express");
const csrf = require("csurf");
const middleware = require("../middleware");
const IndexController = require("../controllers/Index.Controller");
const apicache = require("apicache");
let cache = apicache.middleware;
const router = express.Router();

const csrfProtection = csrf();
router.use(csrfProtection);

// GET: home page
router.get("/", cache("5 minutes"), IndexController.getHome);

// GET: add a product to the shopping cart when "Add to cart" button is pressed
router.get("/add-to-cart/:id", IndexController.addToCart);

// GET: view shopping cart contents
router.get("/shopping-cart", IndexController.getShoppingCart);

// GET: reduce one from an item in the shopping cart
router.get("/shopping-cart/reduce/:id", IndexController.reduceShoppingCart);

// GET: remove all instances of a single product from the cart
router.get("/shopping-cart/removeAll/:id", IndexController.emptyCart);

// GET: checkout form with csrf token
router.get("/checkout", IndexController.checkoutCart);

// // POST: handle checkout logic and payment using Stripe
// router.post("/checkout", middleware.isLoggedIn, async (req, res) => {
//   if (!req.session.cart) {
//     return res.send("!req.session.cart => /shopping-cart");
//   }
//   const cart = await Cart.findById(req.session.cart._id);
//   stripe.charges.create(
//     {
//       amount: cart.totalCost * 100,
//       currency: "usd",
//       source: req.body.stripeToken,
//       description: "Test charge",
//     },
//     function (err, charge) {
//       if (err) {
//         console.log(err);
//         return res.redirect("/checkout");
//       }
//       const order = new Order({
//         user: req.user,
//         cart: {
//           totalQty: cart.totalQty,
//           totalCost: cart.totalCost,
//           items: cart.items,
//         },
//         address: req.body.address,
//         paymentId: charge.id,
//       });
//       order.save(async (err, newOrder) => {
//         if (err) {
//           console.log(err);
//           return res.redirect("/checkout");
//         }
//         await cart.save();
//         await Cart.findByIdAndDelete(cart._id);
//         req.session.cart = null;
//         res.redirect("/user/profile");
//       });
//     }
//   );
// });

module.exports = router;
