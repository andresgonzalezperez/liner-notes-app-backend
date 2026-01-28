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
      return res.status(400).json({ message: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingEmail = await UserModel.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "EMAIL_EXISTS" });
    }

    // Check if username already exists
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "USERNAME_EXISTS" });
    }

    // Hash password
    const salt = bcryptjs.genSaltSync(12);
    const hashedPassword = bcryptjs.hashSync(password, salt);

    // Create user
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
    res.status(500).json({ message: "INTERNAL_ERROR" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists
    const userInDB = await UserModel.findOne({ email: normalizedEmail });
    if (!userInDB) {
      return res.status(400).json({ message: "INVALID_CREDENTIALS" });
    }

    // Check password
    const passwordMatch = bcryptjs.compareSync(password, userInDB.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "INVALID_CREDENTIALS" });
    }

    // Create JWT payload
    const payload = {
      _id: userInDB._id,
      role: userInDB.role,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res.status(200).json({
      message: "LOGIN_SUCCESS",
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
    res.status(500).json({ message: "INTERNAL_ERROR" });
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

