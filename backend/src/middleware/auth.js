import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Authorization header is missing. Please provide a Bearer token.",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Malformed authorization header. Expected format: 'Bearer <token>'.",
    });
  }

  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is missing from server environment configuration.");
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Authentication service misconfiguration.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Attach authenticated identity to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication token has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid authentication token signature.",
    });
  }
}
