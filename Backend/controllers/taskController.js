const Task = require("../models/taskModel");

const STATUS_VARIANTS = {
  pending: ["Pending", "pending", "Pending "],
  inProgress: ["In Progress", "In-progress", "in progress", "inprogress", "In Progress "],
  completed: ["Completed", "completed", "Completed "],
};

const PRIORITY_VARIANTS = {
  low: ["low", "Low", "low "],
  medium: ["medium", "Medium", "Medium "],
  high: ["high", "High", "High "],
};

const normalizePriority = (value) => {
  const priority = String(value || "").trim().toLowerCase();

  if (["low", "medium", "high"].includes(priority)) {
    return priority;
  }

  return "medium";
};

const normalizeStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();

  if (status === "completed") {
    return "Completed";
  }

  if (status === "in progress" || status === "in-progress" || status === "inprogress") {
    return "In Progress";
  }

  return "Pending";
};

const normalizeStatusQuery = (value) => {
  const status = String(value || "").trim();

  if (!status || status.toLowerCase() === "all") {
    return null;
  }

  return normalizeStatus(status);
};

const normalizeChecklist = (items = []) =>
  items
    .filter((item) => item && item.text && String(item.text).trim())
    .map((item) => ({
      text: String(item.text).trim(),
      completed: Boolean(item.completed),
    }));

const getChecklist = (task) => {
  if (Array.isArray(task.todoChecklist) && task.todoChecklist.length) {
    return task.todoChecklist;
  }

  if (Array.isArray(task.todochecklist) && task.todochecklist.length) {
    return task.todochecklist;
  }

  return [];
};

//@desc Get all Tasks (Admin : all,user : assigned)
//@route GET /api/tasks
//access Private
const getTasks = async (req, res) => {
  try {
  const requestedStatus = normalizeStatusQuery(req.query.status);
  const listFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

  if (requestedStatus) {
    listFilter.status = requestedStatus;
  }

    let tasks;
    if ( req.user.role === "admin") {
    tasks = await Task.find(listFilter).populate(
            "assignedTo",
            "name email profileImageUrl"
        );
    } else {
    tasks = await Task.find(listFilter).populate(
            "assignedTo",
            "name email profileImageUrl"
        );
    }
    
  tasks = await Promise.all(
    tasks.map(async (task) => {
      const checklist = getChecklist(task);
      const completedTodoCount = checklist.filter((item) => item.completed).length;

      return {
        ...task.toObject(),
        todoChecklist: checklist,
        completedTodoCount,
      };
    })
  );

  const summaryBaseFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

  const allTasks = await Task.countDocuments(summaryBaseFilter);

  const pendingTasks = await Task.countDocuments({
    ...summaryBaseFilter,
    status: { $in: STATUS_VARIANTS.pending },
  });

  const inProgressTasks = await Task.countDocuments({
    ...summaryBaseFilter,
    status: { $in: STATUS_VARIANTS.inProgress },
  });

  const completedTasks = await Task.countDocuments({
    ...summaryBaseFilter,
    status: { $in: STATUS_VARIANTS.completed },
  });

    res.json({
        tasks,
        statusSummary: {
            all: allTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
        },
    });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Get task by Id 
//@route GET /api/tasks/:id
//access Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);

  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Create a new Task ( admin only)
//@route POST /api/tasks/
//access Private
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,

        } = req.body;

    if (!Array.isArray(assignedTo)) {
        return res
        .status(400)
        .json({ message: "assignedTo must be an array of user IDs" });
    }

        const normalizedChecklist = normalizeChecklist(todoChecklist || []);
    const task = await Task.create({
        title,
        description,
          priority: normalizePriority(priority),
        dueDate,
        assignedTo,
          createdBy: req.user._id,
          attachments: Array.isArray(attachments) ? attachments.filter(Boolean) : [],
          todoChecklist: normalizedChecklist,
          todochecklist: normalizedChecklist,
    });

    res.status(201).json({
        message: "Task created successfully",
        task,
    });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Update a Task by Id 
//@route PUT /api/tasks/:id
//access Private
const updateTask = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) return res.status(404).json({message : "Task not found" });

      if (req.body.title !== undefined) {
        task.title = req.body.title;
      }

      if (req.body.description !== undefined) {
        task.description = req.body.description;
      }

      if (req.body.priority !== undefined) {
        task.priority = normalizePriority(req.body.priority);
      }

      if (req.body.dueDate !== undefined) {
        task.dueDate = req.body.dueDate;
      }

      if (req.body.attachments !== undefined) {
        task.attachments = Array.isArray(req.body.attachments)
          ? req.body.attachments.filter(Boolean)
          : task.attachments;
      }

      if (req.body.todoChecklist !== undefined || req.body.todochecklist !== undefined) {
        const nextChecklist = normalizeChecklist(req.body.todoChecklist || req.body.todochecklist || []);
        task.todoChecklist = nextChecklist;
        task.todochecklist = nextChecklist;
      }

      if (req.body.assignedTo) {
        if (!Array.isArray(req.body.assignedTo)) {
          return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
        }
        task.assignedTo = req.body.assignedTo;
      }

      const updatedTask = await task.save();
      res.json({
        message: "Task updated successfully",
        task: updatedTask,
      });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Delete a Task by Id ( admin Only)
//@route DELETE /api/tasks/:id
//access Private ( admin only)
const deleteTask = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) return res.status(404).json({ message: "Task not found" });

      await task.deleteOne();
      res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Update a Task Status by Id
//@route PUT /api/tasks/:id/status
//access Private ( admin only)
const updateTaskStatus = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if(!task) return res.status(404).json({message:"Task not found"});

      const isAssigned = task.assignedTo.some(
        (userId) => userId.toString() === req.user._id.toString()
      );

      if (!isAssigned && req.user.role !== "admin") {
        return res.status(403).json({message:"Not authorized"});
      }

      task.status = normalizeStatus(req.body.status || task.status);

      if(task.status === "Completed") {
        const checklist = getChecklist(task).map((item) => ({
          text: item.text,
          completed: true,
        }));
        task.todoChecklist = checklist;
        task.todochecklist = checklist;
        task.progress = 100;
      }

      await task.save();
      const updatedTask = await Task.findById(req.params.id).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
      res.json({ message: "Task status updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Update a Task CheckList by Id
//@route PUT /api/tasks/:id/todo
//access Private 
const updateTaskChecklist = async (req, res) => {
    try {
      const { todoChecklist } = req.body;
      const task = await Task.findById(req.params.id);

      if (!task) return res.status(404).json({ message: "Task not found" });

     const isAssigned = task.assignedTo.some(
        (userId) => userId.toString() === req.user._id.toString()
     );

     if (!isAssigned && req.user.role !== "admin") {
        return res
        .status(403)
        .json({ message: "You are not authorized to update this task checklist" });
       }
     
       const nextChecklist = normalizeChecklist(todoChecklist || []);
       task.todoChecklist = nextChecklist;
       task.todochecklist = nextChecklist;

       // Auto-update task status based on checklist completion
        const completedItems = nextChecklist.filter(
          (item) => item.completed
        ).length;
        const totalItems = nextChecklist.length;
        task.progress = 
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // Auto-update task as completed if all checklist items are completed
        if (task.progress === 100) {
          task.status = "Completed";
        } else if (task.progress > 0 ) {
          task.status = "In Progress";
        } else {
          task.status = "Pending";
        }

        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
          "assignedTo",
          "name email profileImageUrl"
        );
        res.json({ message: "Task checklist updated successfully", task : updatedTask });
    } catch (error) {
      res.status(500).json({ message:"Server Error", error: error.message });
    }
  };

//@desc Get Dashboard Data (Admin Only)
//@route GET /api/tasks/dashboard
//access Private ( admin only)
const getDashboardData = async (req, res) => {
    try {
      //Fetch statistics for dashboard
      const totalTasks = await Task.countDocuments();
      const pendingTasks = await Task.countDocuments({ status: { $in: STATUS_VARIANTS.pending } });
      const completedTasks = await Task.countDocuments({ status: { $in: STATUS_VARIANTS.completed } });
      const overdueTasks = await Task.countDocuments({
        status: { $nin: STATUS_VARIANTS.completed },
        dueDate: { $lt: new Date()},
      });

      const taskDistribution = {
        pending: await Task.countDocuments({ status: { $in: STATUS_VARIANTS.pending } }),
        inProgress: await Task.countDocuments({ status: { $in: STATUS_VARIANTS.inProgress } }),
        completed: await Task.countDocuments({ status: { $in: STATUS_VARIANTS.completed } }),
        all: totalTasks,
      };

      const taskPriorityLevels = {
        low: await Task.countDocuments({ priority: { $in: PRIORITY_VARIANTS.low } }),
        medium: await Task.countDocuments({ priority: { $in: PRIORITY_VARIANTS.medium } }),
        high: await Task.countDocuments({ priority: { $in: PRIORITY_VARIANTS.high } }),
      };

        //Fetch recent tasks for dashboard ( limit to 10)
        const recentTasks = await Task.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt todoChecklist todochecklist");

        res.status(200).json({
          statistics: {
          totalTasks,
          pendingTasks,
          completedTasks,
          overdueTasks,
        },
        charts: {
           taskDistribution,
           taskPriorityLevels,
        },
        recentTasks,
       });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

//@desc Get User Dashboard Data 
//@route GET /api/tasks/user-dashboard-data
//access Private 
const getUserDashboardData = async (req, res) => {
    try {
       const userId = req.user._id;// Only fetch data for the logged-in user

       //Fetch statistics for user-specific dashboard tasks
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: { $in: STATUS_VARIANTS.pending } });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: { $in: STATUS_VARIANTS.completed } });
        const overdueTasks = await Task.countDocuments({
          assignedTo: userId,
          status: { $nin: STATUS_VARIANTS.completed },
          dueDate: { $lt: new Date()},
        });

        // Task distribution by status for the user
        const taskDistribution = {
          pending: await Task.countDocuments({ assignedTo: userId, status: { $in: STATUS_VARIANTS.pending } }),
          inProgress: await Task.countDocuments({ assignedTo: userId, status: { $in: STATUS_VARIANTS.inProgress } }),
          completed: await Task.countDocuments({ assignedTo: userId, status: { $in: STATUS_VARIANTS.completed } }),
          all: totalTasks,
        };

        // Task distribution by priority for the user
        const taskPriorityLevels = {
          low: await Task.countDocuments({ assignedTo: userId, priority: { $in: PRIORITY_VARIANTS.low } }),
          medium: await Task.countDocuments({ assignedTo: userId, priority: { $in: PRIORITY_VARIANTS.medium } }),
          high: await Task.countDocuments({ assignedTo: userId, priority: { $in: PRIORITY_VARIANTS.high } }),
        };

        //Fetch recent tasks for user dashboard ( limit to 10)
        const recentTasks = await Task.find({ assignedTo: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt todoChecklist todochecklist");

        res.status(200).json({
          statistics: {
          totalTasks, 
          pendingTasks,
          completedTasks,
          overdueTasks,
        },
        charts: {
           taskDistribution,
            taskPriorityLevels,
          },
          recentTasks,
        });
  } catch (error) {
    res.status(500).json({ message:"Server Error", error: error.message });
  }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
};  