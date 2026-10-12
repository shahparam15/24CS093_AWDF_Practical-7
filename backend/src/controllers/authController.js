import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to generate signed JWT
function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing.");
  }
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    secret,
    { expiresIn: "1h" }
  );
}

// POST /auth/register or /api/auth/register
export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Email address is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Please provide a valid email address.",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Password is required and must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Duplicate Email",
        message: "Email is already registered. Please log in or use a different email.",
      });
    }

    // Create user (password will be hashed in User pre-save hook)
    const user = new User({
      email: normalizedEmail,
      password,
    });

    await user.save();

    // Return safe user representation without password
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login or /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Both email and password are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Find user by normalized email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    // Compare password with bcrypt hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /auth/me or /api/auth/me (Protected by authenticate middleware)
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "User profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
