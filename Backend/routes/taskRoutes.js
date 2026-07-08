const express = require("express");
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require("../controllers/taskController");
const { protect , adminOnly } = require("../middlewares/authMiddleware");
const { updateTaskStatus, updateTaskChecklist, getDashboardData, getUserDashboardData } = require("../controllers/taskController");
const router = express.Router();

// Task Management Routes
router.get("/dashboard",protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/tasks", protect, getTasks);//Get all tasks(Admin : all,User : assigned)
router.get("/:id", protect, getTaskById);//Get task by id
router.post("/",protect, adminOnly, createTask);//Create task
router.put("/:id", protect, adminOnly, updateTask);//Update task by id
router.delete("/:id", protect, adminOnly, deleteTask);//Delete task by id
router.put("/:id/status", protect, adminOnly, updateTaskStatus);//Update task Status by id  
router.put("/:id/todo", protect, updateTaskChecklist);//Update task CheckList by id


module.exports = router;
