const Product = require("../models/Product.model");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// When you create a Electronic Product, it will set the type to Eletronic. 
// When you create a Clothes Product, it will set the type to Clothes. 
let options = { discriminatorKey: 'type' };
// parent Product schema.
const productSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  
 
  available: {
    type: Boolean,
    required: true,
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
}, options);

// child Electronic schema.
let ElectronicProduct = productSchema.discriminator('Electronic', new mongoose.Schema({ cpu: Number , manufacturer: {
  type: String,
}, }, options));

// child Clothing schema. 
let ClothingProduct = productSchema.discriminator('Clothing', new mongoose.Schema({ size: String  ,category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
},}, options));

module.exports = {
  ElectronicProduct: mongoose.model("ElectronicProduct",ElectronicProduct),
  ClothingProduct: mongoose.model("ClothingProduct",ClothingProduct)
}
