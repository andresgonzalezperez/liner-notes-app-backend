const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/jwt.middleware");
const { isAdmin } = require("../middlewares/isAdmin.js");
const uploader = require("../middlewares/cloudinary.config.js");


// --------------------------------------------------
// GET ALL USERS (admin only)
// --------------------------------------------------
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


// --------------------------------------------------
// GET ONE USER (admin or the user themself)
// --------------------------------------------------
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.id && req.payload.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("favoriteAlbums favoriteArtists");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});


// --------------------------------------------------
// ADMIN — UPDATE ANY USER (username, email, role, password)
// --------------------------------------------------
router.patch("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const { id } = req.params;

    const updates = {};

    // Validate username uniqueness
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== id) {
        return res.status(400).json({ message: "USERNAME_EXISTS" });
      }
      updates.username = username;
    }

    // Validate email uniqueness
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail && existingEmail._id.toString() !== id) {
        return res.status(400).json({ message: "EMAIL_EXISTS" });
      }
      updates.email = normalizedEmail;
    }

    // Update role
    if (role) {
      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({ message: "INVALID_ROLE" });
      }
      updates.role = role;
    }

    // Update password if provided
    if (password && password.trim() !== "") {
      const salt = bcrypt.genSaltSync(12);
      updates.password = bcrypt.hashSync(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }

    res.json({ message: "USER_UPDATED", user: updatedUser });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "INTERNAL_ERROR" });
  }
});


// --------------------------------------------------
// DELETE USER (admin only)
// --------------------------------------------------
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.payload._id === userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) return res.status(404).json({ message: "User not found" });

    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin" });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});


// --------------------------------------------------
// USER UPDATES THEIR OWN PROFILE (username + email)
// --------------------------------------------------
router.put("/:id/update", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { username, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true }
    )
      .select("-password")
      .populate("favoriteAlbums favoriteArtists");

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});


// --------------------------------------------------
// USER CHANGES THEIR OWN PASSWORD
// --------------------------------------------------
router.put("/:id/change-password", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const salt = bcrypt.genSaltSync(12);
    user.password = bcrypt.hashSync(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
});


// --------------------------------------------------
// UPLOAD PROFILE PICTURE
// --------------------------------------------------
router.post(
  "/update-profile-picture/:userId",
  uploader.single("imageUrl"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { avatar: req.file.path },
        { new: true }
      )
        .select("-password")
        .populate("favoriteAlbums favoriteArtists");

      res.json({ message: "Image updated", updatedUser });

    } catch (error) {
      res.status(500).json({ errorMessage: error });
    }
  }
);


// --------------------------------------------------
// FAVORITES — ADD / REMOVE ALBUM
// --------------------------------------------------
router.post("/:userId/favorites/albums/:albumId", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { favoriteAlbums: req.params.albumId } },
      { new: true }
    ).populate("favoriteAlbums favoriteArtists");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: "Error adding album to favorites" });
  }
});

router.delete("/:userId/favorites/albums/:albumId", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { favoriteAlbums: req.params.albumId } },
      { new: true }
    ).populate("favoriteAlbums favoriteArtists");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: "Error removing album from favorites" });
  }
});


// --------------------------------------------------
// FAVORITES — ADD / REMOVE ARTIST
// --------------------------------------------------
router.post("/:userId/favorites/artists/:artistId", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { favoriteArtists: req.params.artistId } },
      { new: true }
    ).populate("favoriteAlbums favoriteArtists");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: "Error adding artist to favorites" });
  }
});

router.delete("/:userId/favorites/artists/:artistId", isAuthenticated, async (req, res) => {
  try {
    if (req.payload._id !== req.params.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { favoriteArtists: req.params.artistId } },
      { new: true }
    ).populate("favoriteAlbums favoriteArtists");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: "Error removing artist from favorites" });
  }
});


module.exports = router;




