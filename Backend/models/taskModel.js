const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        text: { type: String, required  : true},
        completed: { type: Boolean, default : false},
    }
);

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

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required : true },
        description: {type: String, required : true},
        priority: {
            type: String,
            enum: ["low", "medium", "high", "Low", "Medium", "High", "low ", "Medium ", "High "],
            default: "medium",
            set: normalizePriority,
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "In Progress",
                "Completed",
                "pending",
                "in progress",
                "in-progress",
                "completed",
                "Pending ",
                "Completed ",
            ],
            default: "Pending",
            set: normalizeStatus,
        },
        dueDate: { type: Date, required : true},
        assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        attachments: [{ type: String }], // Array of file URLs or paths
        todoChecklist: [todoSchema],
        todochecklist: [todoSchema],
        progress: { type: Number, default: 0 }
    },
    { timestamps: true }
);

TaskSchema.pre("save", function (next) {
    if (Array.isArray(this.todoChecklist)) {
        this.todochecklist = this.todoChecklist;
    } else if (Array.isArray(this.todochecklist)) {
        this.todoChecklist = this.todochecklist;
    }

    next();
});

module.exports = mongoose.models.Task || mongoose.model("Task", TaskSchema);
