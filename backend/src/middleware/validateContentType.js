export function validateContentType(req, res, next) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        error: "Unsupported Media Type",
        message: "Content-Type must be application/json.",
      });
    }
  }
  next();
}
