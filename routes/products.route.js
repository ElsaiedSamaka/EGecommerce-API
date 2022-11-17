const ProductsController = require("../controllers/Products.Controller");
const express = require("express");
const router = express.Router();
const apicache = require("apicache");
let cache = apicache.middleware;

// GET: display all products
router.get("/", cache("2 minutes"), ProductsController.getAllProducts);

// GET: search box
router.get("/search", ProductsController.searchProducts);

// GET: get a certain category by its slug (this is used for the categories navbar) = get products by category
router.get("/category/:slug", ProductsController.getProductsByCategory);

// GET: display a certain product by its id
router.get("/:id", ProductsController.getProductByID);

// POST: post NEW product
router.post("/", ProductsController.addProduct);

// PATCH: update product
router.patch("/:id", ProductsController.updateProduct);

// Delete: delete a product
router.delete("/:id", ProductsController.deleteProduct);
module.exports = router;
