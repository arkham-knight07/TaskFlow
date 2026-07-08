import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  FiCheck,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

const statusTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "In-progress" },
  { label: "Completed", value: "completed" },
];

const priorityBadgeClasses = {
  low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  high: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const ManageTasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const params = statusFilter ? { status: statusFilter } : undefined;
        const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, { params });

        if (!isMounted) return;

        setTasks(Array.isArray(response.data?.tasks) ? response.data.tasks : []);
        setStatusSummary(response.data?.statusSummary || {});
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError.response?.data?.message || "Failed to load tasks");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch = !query
        ? true
        : [task.title, task.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);

      return matchesSearch;
    });
  }, [search, tasks]);

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm("Delete this task permanently?");
    if (!confirmed) return;

    try {
      setActionLoading(taskId);
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      setTasks((previous) => previous.filter((task) => task._id !== taskId));
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Failed to delete task");
    } finally {
      setActionLoading("");
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      setActionLoading(taskId);
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_STATUS(taskId), {
        status: nextStatus,
      });

      setTasks((previous) =>
        previous.map((task) => (task._id === taskId ? response.data?.task || task : task))
      );
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Failed to update task status");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Task operations</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Manage tasks</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Search, filter, update status, and remove tasks from the admin workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/create-tasks")}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <FiPlus />
              New Task
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Total</p>
            <p className="mt-2 text-3xl font-semibold text-white">{statusSummary.all ?? tasks.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-white">{statusSummary.pendingTasks ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="mt-2 text-3xl font-semibold text-white">{statusSummary.inProgressTasks ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-white">{statusSummary.completedTasks ?? 0}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks by title or description"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                type="button"
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === tab.value
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Task</th>
                  <th className="px-5 py-4 font-medium">Priority</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Due</th>
                  <th className="px-5 py-4 font-medium">Assigned</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                      Loading tasks...
                    </td>
                  </tr>
                ) : filteredTasks.length ? (
                  filteredTasks.map((task) => {
                    const currentStatus = task.status || "Pending";
                    const currentPriority = String(task.priority || "medium").toLowerCase().trim();
                    const assignedNames = Array.isArray(task.assignedTo)
                      ? task.assignedTo.map((user) => user?.name || user?.email || "Member").join(", ")
                      : "Unassigned";

                    return (
                      <tr key={task._id} className="align-top hover:bg-white/5">
                        <td className="px-5 py-4">
                          <div className="max-w-[320px]">
                            <p className="font-semibold text-white">{task.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{task.description}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityBadgeClasses[currentPriority] || priorityBadgeClasses.medium}`}>
                            {currentPriority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={currentStatus}
                            onChange={(event) => handleStatusChange(task._id, event.target.value)}
                            disabled={actionLoading === task._id}
                            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold text-white outline-none transition focus:border-cyan-400 disabled:opacity-60"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {task.dueDate ? moment(task.dueDate).format("MMM D, YYYY") : "No due date"}
                        </td>
                        <td className="px-5 py-4 text-slate-300">{assignedNames}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/tasks/edit/${task._id}`)}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                            >
                              <FiEdit2 />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(task._id, "Completed")}
                              disabled={actionLoading === task._id}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-60"
                            >
                              <FiCheck />
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(task._id)}
                              disabled={actionLoading === task._id}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
                            >
                              <FiTrash2 />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;
