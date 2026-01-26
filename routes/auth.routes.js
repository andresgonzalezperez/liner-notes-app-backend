const router = require("express").Router();
const UserModel = require("../models/User.model");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/jwt.middleware.js");

// SIGNUP
router.post("/signup", async (req, res) => {
  const { username, email, password, avatar } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ errorMessage: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userAlreadyInDB = await UserModel.findOne({ email: normalizedEmail });
    if (userAlreadyInDB) {
      return res.status(403).json({ errorMessage: "Email already in use." });
    }

    const salt = bcryptjs.genSaltSync(12);
    const hashedPassword = bcryptjs.hashSync(password, salt);

    const createdUser = await UserModel.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      avatar: avatar || "",
    });

    res.status(201).json({
      _id: createdUser._id,
      username: createdUser.username,
      avatar: createdUser.avatar,
      role: createdUser.role, 
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const userInDB = await UserModel.findOne({ email: normalizedEmail });
    if (!userInDB) {
      return res.status(403).json({ errorMessage: "Invalid credentials." });
    }

    const passwordMatch = bcryptjs.compareSync(password, userInDB.password);
    if (!passwordMatch) {
      return res.status(403).json({ errorMessage: "Invalid credentials." });
    }

    const payload = {
      _id: userInDB._id,
      role: userInDB.role,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res.status(200).json({
      message: "Login successful",
      authToken,
      user: {
        _id: userInDB._id,
        username: userInDB.username,
        avatar: userInDB.avatar,
        role: userInDB.role,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

// VERIFY TOKEN
router.get("/verify", isAuthenticated, async (req, res) => {
  try {
    const currentUser = await UserModel.findById(req.payload._id)
      .select("-password")
      .populate("favoriteAlbums")
      .populate("favoriteArtists");

    res.status(200).json(currentUser);

  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});


module.exports = router;

