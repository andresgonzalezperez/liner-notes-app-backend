// Middleware to check if the logged user is an admin

function isAdmin(req, res, next) {
  try {
    // Check if payload exists (set by isAuthenticated)
    if (!req.payload) {
      return res.status(401).json({ errorMessage: "User not authenticated" });
    }

    // Check if user has admin role
    if (req.payload.role !== "admin") {
      return res.status(403).json({ errorMessage: "Admin privileges required" });
    }

    // User is admin, continue
    next();

  } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
}

module.exports = { isAdmin };
