const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AuthMiddleware - Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("AuthMiddleware - Missing or malformed auth header");
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  console.log(
    "AuthMiddleware - Extracted token (first 50 chars):",
    token.substring(0, 50) + "..."
  );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("AuthMiddleware - Token decoded successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("AuthMiddleware - JWT verification failed:", err.message);
    console.error(
      "AuthMiddleware - JWT_SECRET exists:",
      !!process.env.JWT_SECRET
    );
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateJWT;
