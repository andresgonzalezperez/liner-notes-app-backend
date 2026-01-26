const router = require("express").Router();
const Album = require("../models/Album.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");
const { isAdmin } = require("../middlewares/isAdmin");
const uploader = require("../middlewares/cloudinary.config.js");

// GET all albums
router.get("/", async (req, res) => {
  try {
    const albums = await Album.find().populate("artist");
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: "Error fetching albums" });
  }
});

// GET one album
router.get("/:id", async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("artist")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "username avatar",
        },
      });

    if (!album) return res.status(404).json({ message: "Album not found" });

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: "Error fetching album" });
  }
});

// CREATE album (admin only)
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const newAlbum = await Album.create(req.body);
    res.json(newAlbum);
  } catch (error) {
    res.status(500).json({ message: "Error creating album" });
  }
});

// UPDATE album (admin only)
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    res.json(updatedAlbum);
  } catch (error) {
    res.status(500).json({ message: "Error updating album" });
  }
});

// DELETE album (admin only)
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: "Album deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting album" });
  }
});

// ADD REVIEW to album (any logged user)
router.post("/:id/reviews", isAuthenticated, async (req, res) => {
  try {
    const { comment, rating } = req.body;

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
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
    ).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username avatar",
      },
    });

    res.json(updatedAlbum);
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
});

// DELETE REVIEW (admin only)
router.delete(
  "/:id/reviews/:reviewId",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const updatedAlbum = await Album.findByIdAndUpdate(
        req.params.id,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true },
      );

      res.json(updatedAlbum);
    } catch (error) {
      res.status(500).json({ message: "Error deleting review" });
    }
  },
);

// UPLOAD album cover
router.post(
  "/:albumId/upload-cover",
  isAuthenticated,
  isAdmin,
  uploader.single("imageUrl"),
  async (req, res) => {
    try {
      const updatedAlbum = await Album.findByIdAndUpdate(
        req.params.albumId,
        { cover: req.file.path },
        { new: true }
      );

      res.json(updatedAlbum);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error uploading album cover" });
    }
  }
);

module.exports = router;
