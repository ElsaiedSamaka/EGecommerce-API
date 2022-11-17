const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.DB_PROD_URL || process.env.DB_DEV_URL;
    await mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .catch((error) => console.log(error));
    const connection = mongoose.connection;
    console.log("MONGODB CONNECTED SUCCESSFULLY!");
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = connectDB;
