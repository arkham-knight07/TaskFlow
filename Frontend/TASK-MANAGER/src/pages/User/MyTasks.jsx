import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { FiArrowRight, FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";

const filterTabs = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "In-progress" },
    { label: "Completed", value: "completed" },
];

const priorityClasses = {
    low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    high: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

const MyTasks = () => {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

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
            } catch (fetchError) {
                if (!isMounted) return;
                setError(fetchError.response?.data?.message || "Failed to load your tasks");
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
            if (!query) return true;

            return [task.title, task.description, task.status, task.priority]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }, [search, tasks]);

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6 lg:p-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Your workload</p>
                        <h1 className="mt-2 text-3xl font-semibold text-white">My tasks</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Review your assigned work, filter by status, and open each task for full details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        <FiRefreshCw />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1">
                            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search your tasks"
                                className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                <FiFilter />
                                Status
                            </div>
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.label}
                                    type="button"
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
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3">
                            Loading your tasks...
                        </div>
                    ) : filteredTasks.length ? (
                        filteredTasks.map((task) => {
                            const progress = Number(task.progress) || 0;
                            const currentPriority = String(task.priority || "medium").toLowerCase().trim();

                            return (
                                <article
                                    key={task._id}
                                    className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/20 transition hover:border-cyan-400/30 hover:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">{task.title}</h2>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Due {task.dueDate ? moment(task.dueDate).format("MMM D, YYYY") : "not set"}
                                            </p>
                                        </div>

                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityClasses[currentPriority] || priorityClasses.medium}`}>
                                            {currentPriority}
                                        </span>
                                    </div>

                                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                                        {task.description || "No description provided."}
                                    </p>

                                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-white/10">
                                            <div
                                                className="h-2 rounded-full bg-linear-to-r from-cyan-400 to-blue-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-400">
                                        <span>{task.status || "Pending"}</span>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/user/tasks-details/${task._id}`)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                                        >
                                            Open
                                            <FiArrowRight />
                                        </button>
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-10 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3">
                            No tasks found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;