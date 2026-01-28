const router = require("express").Router();
const Artist = require("../models/Artist.model");
const Album = require("../models/Album.model");

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) return res.json({ artists: [], albums: [] });

    const artists = await Artist.find({
      name: { $regex: query, $options: "i" }
    });

    const albums = await Album.find({
      title: { $regex: query, $options: "i" }
    });

    res.json({ artists, albums });

  } catch (error) {
    res.status(500).json({ message: "Error searching" });
  }
});

module.exports = router;
