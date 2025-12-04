const mongoose = require("mongoose");

// User ka structure (schema) define kar rahe hain
const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true   // same email se 2 account nahi
    },
    password: { 
      type: String, 
      required: true 
    },
    isOnline: { 
      type: Boolean, 
      default: false  // realtime presence ke liye
    }
  },
  {
    timestamps: true // automatically createdAt, updatedAt add karega
  }
);

// Is schema se "User" model banaya
module.exports = mongoose.model("User", userSchema);
