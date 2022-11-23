const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {
    type: String,
    require: true,
    minlength: 3,
    maxlength: 128,
    trim: true
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    require: true,
  },
  permissionLevel: {
    type: Number,
    default: 1,
  },
  profilePhoto: {
    type: String,
    default: function () {
      return `https://secure.gravatar.com/avatar/${this._id}?s=90&d=identicon`;
    },
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 10,
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 128,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 128,
  },
  state: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 128,
  },
  zip: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 5,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

// encrypt the password before storing
userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } else {
    return false;
  }
};
userSchema.methods.comparePassword = function (password) {
  const user = this;
  return bcrypt.compareSync(password, user.password);
};

userSchema.set("toJSON", { getters: true });
userSchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};
module.exports = mongoose.model("User", userSchema);
