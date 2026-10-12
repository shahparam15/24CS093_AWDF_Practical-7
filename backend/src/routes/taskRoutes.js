import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { validateContentType } from "../middleware/validateContentType.js";

const router = Router();

// Enforce authentication on all task routes
router.use(authenticate);

router.get("/", getTasks);
router.get("/:id", validateObjectId, getTaskById);
router.post("/", validateContentType, createTask);
router.put("/:id", validateObjectId, validateContentType, updateTask);
router.delete("/:id", validateObjectId, deleteTask);

export default router;
