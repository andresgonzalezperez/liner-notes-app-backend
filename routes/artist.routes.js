const router = require("express").Router();
const Artist = require("../models/Artist.model");
const Album = require("../models/Album.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");
const { isAdmin } = require("../middlewares/isAdmin");
const uploader = require("../middlewares/cloudinary.config.js");

// CREATE artist (admin only)
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const createdArtist = await Artist.create(req.body);
    res.status(201).json(createdArtist);
  } catch (error) {
    res.status(500).json({ errorMessage: "Error creating artist" });
  }
});

// GET all artists
router.get("/", async (req, res) => {
  try {
    const artists = await Artist.find();
    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ errorMessage: "Error fetching artists" });
  }
});

// GET one artist
router.get("/:artistId", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username avatar",
      },
    });

    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json({ errorMessage: "Error fetching artist" });
  }
});

// GET albums of an artist
router.get("/:artistId/albums", async (req, res) => {
  try {
    const albums = await Album.find({ artist: req.params.artistId }).populate(
      "artist",
    );
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: "Error fetching albums for artist" });
  }
});

// UPDATE artist (admin only)
router.put("/:artistId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.artistId,
      req.body,
      { new: true },
    );
    res.status(200).json(updatedArtist);
  } catch (error) {
    res.status(500).json({ errorMessage: "Error updating artist" });
  }
});

// DELETE artist (admin only)
router.delete("/:artistId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.artistId);
    res.status(200).json({ message: "Artist deleted" });
  } catch (error) {
    res.status(500).json({ errorMessage: "Error deleting artist" });
  }
});

// ADD REVIEW to artist (any logged user)
router.post("/:artistId/reviews", isAuthenticated, async (req, res) => {
  try {
    const { comment, rating } = req.body;

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.artistId,
      {
        $push: {
          reviews: {
            user: req.payload._id,
            comment,
            rating,
            date: new Date(),
          },
        },
      },
      { new: true },
    ).populate("reviews.user", "username avatar");

    res.json(updatedArtist);
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
});

// DELETE REVIEW (admin only)
router.delete(
  "/:artistId/reviews/:reviewId",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const updatedArtist = await Artist.findByIdAndUpdate(
        req.params.artistId,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true },
      );

      res.json(updatedArtist);
    } catch (error) {
      res.status(500).json({ message: "Error deleting review" });
    }
  },
);

// UPLOAD artist image
router.post(
  "/:artistId/upload-image",
  isAuthenticated,
  isAdmin,
  uploader.single("imageUrl"),
  async (req, res) => {
    try {
      const updatedArtist = await Artist.findByIdAndUpdate(
        req.params.artistId,
        { image: req.file.path },
        { new: true }
      );

      res.json(updatedArtist);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error uploading artist image" });
    }
  }
);


module.exports = router;
