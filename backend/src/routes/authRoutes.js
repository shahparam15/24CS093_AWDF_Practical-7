import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validateContentType } from "../middleware/validateContentType.js";

const router = Router();

// Public routes
router.post("/register", validateContentType, register);
router.post("/login", validateContentType, login);

// Protected routes
router.get("/me", authenticate, getMe);

export default router;
