const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin"
  }
},
  {
    timeStamps: true,
  }
)

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Password Compare Method
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Generate JWT Token
adminSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};



const Admin = mongoose.model("Admin", adminSchema)

module.exports = { Admin }