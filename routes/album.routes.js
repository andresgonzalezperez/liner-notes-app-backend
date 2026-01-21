// routes/album.routes.js
const router = require("express").Router();
const AlbumModel = require("../models/Album.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");
const { isAdmin } = require("../middlewares/isAdmin");

// CREATE album (admin only)
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Create a new album
    const createdAlbum = await AlbumModel.create(req.body);
    res.status(201).json(createdAlbum);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error creating album" });
  }
});

// GET all albums
router.get("/", async (req, res) => {
  try {
    // Retrieve all albums with artist info
    const albums = await AlbumModel.find().populate("artist");
    res.status(200).json(albums);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error fetching albums" });
  }
});

// GET one album
router.get("/:albumId", async (req, res) => {
  try {
    // Retrieve a single album with artist info
    const album = await AlbumModel.findById(req.params.albumId).populate("artist");
    res.status(200).json(album);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error fetching album" });
  }
});

// UPDATE album (admin only)
router.put("/:albumId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Update album information
    const updatedAlbum = await AlbumModel.findByIdAndUpdate(
      req.params.albumId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedAlbum);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error updating album" });
  }
});

// DELETE album (admin only)
router.delete("/:albumId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Delete album
    await AlbumModel.findByIdAndDelete(req.params.albumId);
    res.status(200).json({ message: "Album deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error deleting album" });
  }
});

module.exports = router;
