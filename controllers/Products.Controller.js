const Product = require("../models/Product.model");
const Category = require("../models/Category.model");
var moment = require("moment");

// GET: display all products
const getAllProducts = async (req, res) => {
  const perPage = 10;
  let page = parseInt(req.query.page) || 1;

  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.count();

    res.json({
      pageName: "All Products",
      products,
      current: page,
      breadcrumbs: null,
      home: "/products/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
};

// GET: search box
const searchProducts = async (req, res) => {
  const perPage = 10;
  let page = parseInt(req.query.page) || 1;

  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
    })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category")
      .exec();
    const count = await Product.count({
      title: { $regex: req.query.search, $options: "i" },
    });
    res.json({
      pageName: "Search Results",
      products,
      current: page,
      breadcrumbs: null,
      home: "/products/search?search=" + req.query.search + "&",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect({ error });
  }
};

//GET: get a certain category by its slug (this is used for the categories navbar)
const getProductsByCategory = async (req, res) => {
  const perPage = 10;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allProducts = await Product.find({ category: foundCategory.id })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Product.count({ category: foundCategory.id });

    res.json({
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      products: allProducts,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/products/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
};
// GET: display a certain product by its id
const getProductByID = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    res.json({
      pageName: product.title,
      product,
      moment: moment,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
};

// POST: post new product
// TODO: allow only admin to add products
// TODO: add validatetion for adding products with same productCode as it act as unique indexe
const addProduct = async (req, res) => {
  const { body } = req;
  try {
    const {
      title,
      price,
      description,
      category,
      imagePath,
      available,
    } = body;

    const newProduct = new Product({
      title,
      price,
      description,
      category,
      imagePath,
      available,
    });
    await newProduct.save();

    return res.status(201).json(newProduct);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// PUT: update product
// TODO: allow only admin to update products
const updateProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category,
      imagePath,
      available,
    } = req.body;
    let productID = req.params.id;
    const product = await Product.findByIdAndUpdate(
      productID,
      {
        $set: {
          title,
          price,
          description,
          category,
          imagePath,
          available,
        },
      },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ msg: "This product does not exist." });

    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Delete a product
// TODO: allow only admin to deleteProduct
const deleteProduct = async (req, res) => {
  let productID = req.params.id;
  try {
    const product = await Product.findByIdAndDelete(productID);
    if (!product)
      return res.status(404).json({ msg: "This product does not exist." });

    return res.status(200).json({ msg: "Delete Success!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ mssg: err });
  }
};

module.exports = {
  getAllProducts,
  searchProducts,
  getProductsByCategory,
  getProductByID,
  addProduct,
  updateProduct,
  deleteProduct,
};
