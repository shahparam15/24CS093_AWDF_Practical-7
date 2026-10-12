import mongoose from "mongoose";

export function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: `Invalid ObjectId parameter format: '${id}'. Must be a 24-character hexadecimal string.`,
    });
  }
  next();
}
