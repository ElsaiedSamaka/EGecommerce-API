const Product = require("../models/Product.model");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// parent Product schema.
const productSchema = Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 128
  },
  imagePath: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
    min: 0,
    max: 100000,
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  available: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rate:{
    type: Number,
    default:0
  },
  ratingCount:{
   type:Number,
  },
  discount:{
    type:Number,
    default: 0
  }
});


module.exports = mongoose.model("Product", productSchema);
