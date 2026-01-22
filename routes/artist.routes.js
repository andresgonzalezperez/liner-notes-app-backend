// routes/artist.routes.js
const router = require("express").Router();
const ArtistModel = require("../models/Artist.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");
const { isAdmin } = require("../middlewares/isAdmin");
const Album = require("../models/Album.model");


// CREATE artist (admin only)
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Create a new artist
    const createdArtist = await ArtistModel.create(req.body);
    res.status(201).json(createdArtist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error creating artist" });
  }
});

// GET all artists
router.get("/", async (req, res) => {
  try {
    // Retrieve all artists
    const artists = await ArtistModel.find();
    res.status(200).json(artists);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error fetching artists" });
  }
});

// GET one artist
router.get("/:artistId", async (req, res) => {
  try {
    // Retrieve a single artist
    const artist = await ArtistModel.findById(req.params.artistId);
    res.status(200).json(artist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error fetching artist" });
  }
});

// GET /artists/:artistId/albums
router.get("/:artistId/albums", async (req, res) => {
  try {
    const { artistId } = req.params;

    const albums = await Album.find({ artist: artistId });

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: "Error fetching albums for artist" });
  }
});

// UPDATE artist (admin only)
router.put("/:artistId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Update artist information
    const updatedArtist = await ArtistModel.findByIdAndUpdate(
      req.params.artistId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedArtist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error updating artist" });
  }
});

// DELETE artist (admin only)
router.delete("/:artistId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Delete artist
    await ArtistModel.findByIdAndDelete(req.params.artistId);
    res.status(200).json({ message: "Artist deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Error deleting artist" });
  }
});

module.exports = router;

