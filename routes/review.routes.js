// routes/review.routes.js
const router = require("express").Router();
const ReviewModel = require("../models/Review.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// CREATE review
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // Create a new review linked to the logged user
    const createdReview = await ReviewModel.create({
      ...req.body,
      user: req.payload._id,
    });

    res.status(201).json(createdReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error creating review" });
  }
});

// GET reviews for an album
router.get("/album/:albumId", async (req, res) => {
  try {
    // Retrieve all reviews for a specific album
    const reviews = await ReviewModel.find({ album: req.params.albumId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error fetching reviews" });
  }
});

// DELETE review
router.delete("/:reviewId", isAuthenticated, async (req, res) => {
  try {
    // Delete review only if it belongs to the logged user
    await ReviewModel.findOneAndDelete({
      _id: req.params.reviewId,
      user: req.payload._id,
    });

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error deleting review" });
  }
});

module.exports = router;
