const { Schema, model } = require("mongoose");

const artistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        date: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

const Artist = model("Artist", artistSchema);

module.exports = Artist;
