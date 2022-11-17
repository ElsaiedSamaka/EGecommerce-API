const Category = require("../models/Category.model");
var moment = require("moment");

// GET: display all categories
const getAllCategories = async (req, res) => {
  const perPage = 10;
  let page = parseInt(req.query.page) || 1;

  try {
    const categories = await Category.find({});

    const count = await Category.count();

    res.json({
      pageName: "All Categories",
      categories: categories,
      current: page,
      home: "/categories/?",
    });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
};

// POST: post new category
const addCategory = async (req, res) => {
  const { body } = req;
  try {
    const { title } = body;

    const newCategory = new Category({
      title,
    });
    await newCategory.save();

    return res.status(201).json(newCategory);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// PUT: update Category
// TODO: allow only admin to update products
const updateCategory = async (req, res) => {
  try {
    const { title } = req.body;
    let categoryID = req.params.id;
    const category = await Category.findByIdAndUpdate(
      categoryID,
      {
        $set: {
          title,
        },
      },
      { new: true }
    );

    if (!category)
      return res.status(404).json({ msg: "This category does not exist." });

    return res.status(200).json(category);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
// TODO: allow only admin to deleteProduct
const deleteCategory = async (req, res) => {
  let categoryID = req.params.id;
  try {
    const category = await Category.findByIdAndDelete(categoryID);
    if (!category)
      return res.status(404).json({ msg: "This category does not exist." });

    return res.status(200).json({ msg: "Delete Success!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ mssg: err });
  }
};


module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
