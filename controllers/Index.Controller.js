const Product = require("../models/Product.model");
const Cart = require("../models/Cart.model");
const middleware = require("../middleware");
const { default: mongoose } = require("mongoose");

// GET: home page
// TODO: custom this end-point to retrieve different type of products i.e. (Featured , Lateset , ...)
const getHome = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category");
    res.json({ pageName: "Home", products });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
};

// GET: add a product to the shopping cart when "Add to cart" button is pressed
const addToCart = async (req, res) => {
  const productId = req.params.id;
  console.log(productId);
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty++;
      cart.totalCost += product.price;
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;

    res.json({ cart: cart });
  } catch (err) {
    res.json({ mssg: err });
  }
};

// GET: view shopping cart contents
const getShoppingCart = async (req, res) => {
  try {
    // find the cart, whether in session or in db based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      return res.json({
        cart: cart_user,
        pageName: "Shopping Cart",
        products: await productsFromCart(cart_user),
      });
    }
    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.json({
        cart: null,
        pageName: "Shopping Cart",
        products: null,
      });
    }
    // otherwise, load the session's cart
    return res.json({
      cart: req.session.cart,
      products: await productsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.json({ err });
  }
};

// GET: reduce one from an item in the shopping cart
const reduceShoppingCart = async function (req, res, next) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    res.json({
      cart: cart,
      products: await productsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.json({ err });
  }
};

// GET: remove all instances of a single product from the cart
const emptyCart = async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.json({
      cart: cart,
      products: await productsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.json({ err });
  }
};

// GET: checkout form with csrf token
const checkoutCart = async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  //load the cart with the session's cart's id from the db
  cart = await Cart.findById(req.session.cart._id);
  res.json({
    total: cart.totalCost,
    csrfToken: req.csrfToken(),
    pageName: "Checkout",
  });
};
// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) {
    let foundProduct = (
      await Product.findById(item.productId).populate("category")
    ).toObject();
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}

module.exports = {
  getHome,
  addToCart,
  getShoppingCart,
  reduceShoppingCart,
  emptyCart,
  checkoutCart,
};
