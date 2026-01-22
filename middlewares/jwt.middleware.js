const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header exists
    if (!authHeader) {
      return res.status(403).json({ errorMessage: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");

    // 2. Must have exactly 2 parts: "Bearer <token>"
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(403).json({ errorMessage: "Headers Malformed" });
    }

    const token = parts[1];

    // 3. Detect invalid tokens coming from localStorage
    if (!token || token === "null" || token === "undefined") {
      return res.status(403).json({ errorMessage: "Invalid Token" });
    }

    // 4. Verify token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // 5. Attach payload
    req.payload = decodedToken;

    next();

  } catch (error) {
    console.log(error);
    return res.status(403).json({ errorMessage: "Invalid or expired token" });
  }
}

module.exports = { isAuthenticated };

