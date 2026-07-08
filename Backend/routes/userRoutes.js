const express = require("express");
const {adminOnly , protect} = require("../middlewares/authMiddleware");
const { getUsers , getUserById ,updateUser, deleteUser} = require("../controllers/userController");
const router = express.Router();

//User Management Routes
router.get("/",protect, adminOnly,getUsers);//Get all users(admin only)
router.get("/:id",protect, adminOnly,getUserById);//Get a specific user
router.put("/:id",protect, adminOnly,updateUser);//Update a specific user
router.delete("/:id",protect, adminOnly,deleteUser);//Delete a specific user
    
module.exports = router;