const { Schema, model } = require("mongoose");

const albumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear(),
    },
    cover: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      required: true,
    },
    tracklist: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Album = model("Album", albumSchema);

module.exports = Album;