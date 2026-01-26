const { Schema, model } = require("mongoose");

const albumSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    year: { type: Number, required: true },
    cover: { type: String, default: "" },
    genre: { type: String, required: true },
    tracklist: [{ type: String, required: true }],
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        comment: String,
        rating: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const Album = model("Album", albumSchema);

module.exports = Album;

