const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
function isAuthenticated(req, res, next) {
  try {
    // Check if Authorization header exists
    if (!req.headers.authorization) {
      return res.status(403).json({ errorMessage: "Authorization header missing" });
    }

    const [scheme, token] = req.headers.authorization.split(" ");

    // Check if header follows "Bearer <token>" format
    if (scheme !== "Bearer" || !token) {
      return res.status(403).json({ errorMessage: "Malformed authorization header" });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // Attach payload to request
    req.payload = decodedToken;

    next();

  } catch (error) {
    console.log(error);
    return res.status(403).json({ errorMessage: "Invalid or expired token" });
  }
}

module.exports = { isAuthenticated };
