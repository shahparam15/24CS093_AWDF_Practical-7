export function errorHandler(err, req, res, next) {
  // Handle JSON parsing syntax error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Malformed JSON payload in request body.",
    });
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const val = err.keyValue ? err.keyValue[field] : "";
    return res.status(400).json({
      success: false,
      error: "Duplicate Key Error",
      message: `The ${field} '${val}' is already registered. Please use another ${field}.`,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: errors.join(" "),
      details: errors,
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: `Invalid format for field '${err.path}': ${err.value}.`,
    });
  }

  // Fallback 500 Server Error
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message || "An unexpected internal server error occurred.",
  });
}
