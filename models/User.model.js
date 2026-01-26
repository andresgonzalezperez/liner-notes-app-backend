const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    favoriteAlbums: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Album" 
      }
    ],
    favoriteArtists: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Artist" 
      }
    ],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

module.exports = User;
