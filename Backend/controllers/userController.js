const Task = require('../models/taskModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

//@desc Get all users(Admin only)
//@route GET /api/users/
//@access Private(Admin)
const getUsers = async (req, res) => {
    try{
        const users = await User.find({ role:'member'}).select("-password");

        //Add tasks Counts to each user
        const userWithTaskCounts = await Promise.all(
            users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({
                 assignedTo: user._id, 
                  status: { $in: ["Pending", "pending", "Pending "] }
                });

            const inProgressTasks = await Task.countDocuments({ 
                assignedTo: user._id, 
                  status: { $in: ["In Progress", "In-progress", "in progress", "inprogress"] }
            });

            const completedTasks = await Task.countDocuments ({ 
                assignedTo: user._id, 
                  status: { $in: ["Completed", "completed", "Completed "] }
            });

            return {
                ...user._doc,//Include user details all existing fields
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        })
    );
        res.json(userWithTaskCounts);

    } catch (error) {
        res.status(500).json({ message: "Server error" ,error : error.message });
    }
};

//@desc Get user by ID
//@route GET/api/users/:id
//@access Private
const getUserById = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({message: "User not found"});
        res.json(user);
    }catch (error) {
        res.status(500).json({ message: "Server error" ,error : error.message });
    }
};

//@desc Update user by ID
//@route PUT /api/users/:id
//@access Private(Admin)
const updateUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const fieldsToUpdate = [
            "name",
            "email",
            "role",
            "department",
            "designation",
            "profileImageUrl",
            "isActive",
        ];

        fieldsToUpdate.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        res.json({
            message: "User updated successfully",
            user: {
                ...updatedUser.toObject(),
                password: undefined,
            },
        });

    }catch (error) {
        res.status(500).json({ message: "Server error" ,error : error.message });
    }
};

//@desc Delete a user ( Admin only)
//@route DELETE /api/users/:id
//@access Private(Admin)
const deleteUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });

    }catch (error) {
        res.status(500).json({ message: "Server error" ,error : error.message });
    }   
};


module.exports = { getUsers,getUserById,updateUser,deleteUser };