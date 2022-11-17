const CategoriesController = require("../controllers/Categories.Controller");
const express = require("express");
const router = express.Router();
const apicache = require("apicache");
let cache = apicache.middleware;

// GET: display all categories
router.get("/", cache("2 minutes"), CategoriesController.getAllCategories);

// POST: post NEW Category
router.post("/", CategoriesController.addCategory);

// PATCH: update Category
router.patch("/:id", CategoriesController.updateCategory);

// Delete: delete a Category
router.delete("/:id", CategoriesController.deleteCategory);
module.exports = router;
