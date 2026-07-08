const Task = require('../models/taskModel');
const User = require('../models/userModel');
const excelJS = require('exceljs');

const normalizeStatus = (value) => {
    const status = String(value || "").trim().toLowerCase();

    if (status === "completed") return "Completed";
    if (status === "in progress" || status === "in-progress" || status === "inprogress") return "In Progress";
    return "Pending";
};


//@desc Export all tasks as an Excel file
//@route GET /api/reports/export/tasks
//@access Private (Admin only)
const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find().populate("assignedTo","name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");
        worksheet.columns = [
            { header: "Task ID", key: "_id", width: 30 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Status", key: "status", width: 20 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Due Date", key: "dueDate", width: 20 },
        ];

        tasks.forEach((task) => {
            const assignedTo = Array.isArray(task.assignedTo)
            ? task.assignedTo
                .map((user) => `${user.name} (${user.email})`)
                .join(", ")
            : "Unassigned";

            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
                assignedTo,
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=tasks_report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res
        .status(500)
            .json({ message: "Server error", error: error.message });
    }
};

//@desc Export user-task report as an Excel file
//@route GET /api/reports/export/users
//@access Private (Admin only)
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find().select("name email _id").lean();
        const tasks = await Task.find().populate(
            "assignedTo",
            "name email _id"
        );

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                tasks: 0,
                pendingtasks: 0,
                inprogresstasks: 0,
                completedtasks: 0,
            };
        });
        
        tasks.forEach((task) => {
            if (task.assignedTo) {
                task.assignedTo.forEach((assignedUser) => {
                    if (userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].tasks++;
                        switch (normalizeStatus(task.status)) {
                            case "Pending":
                                userTaskMap[assignedUser._id].pendingtasks++;
                                break;
                            case "In Progress":
                                userTaskMap[assignedUser._id].inprogresstasks++;
                                break;
                            case "Completed":
                                userTaskMap[assignedUser._id].completedtasks++;
                                break;
                        }
                    }
                });
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User-Task Report");
        worksheet.columns = [
            { header: "User Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 40 },
            { header: "Total Assigned Tasks", key: "tasks", width: 20 },
            { header: "Pending Tasks", key: "pendingtasks", width: 20 },
            { header: "In Progress Tasks", key: "inprogresstasks", width: 20 },
            { header: "Completed Tasks", key: "completedtasks", width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=users_report.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    exportTasksReport,
    exportUsersReport
};
