import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { FiArrowLeft, FiCheckCircle, FiClock, FiRefreshCw } from "react-icons/fi";

const statusColors = {
    pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    "in-progress": "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
};

const ViewTaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchTask = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));

                if (!isMounted) return;

                setTask(response.data || null);
            } catch (fetchError) {
                if (!isMounted) return;
                setError(fetchError.response?.data?.message || "Failed to load task details");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (id) fetchTask();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const checklist = useMemo(() => {
        if (!task) return [];

        return Array.isArray(task.todoChecklist || task.todochecklist)
            ? task.todoChecklist || task.todochecklist
            : [];
    }, [task]);

    const progress = useMemo(() => {
        if (!checklist.length) return Number(task?.progress) || 0;

        const completedCount = checklist.filter((item) => item.completed).length;
        return Math.round((completedCount / checklist.length) * 100);
    }, [checklist, task?.progress]);

    const updateChecklist = async (index) => {
        if (!task) return;

        try {
            setSaving(true);
            setSuccess("");
            setError("");

            const nextChecklist = checklist.map((item, itemIndex) =>
                itemIndex === index ? { ...item, completed: !item.completed } : item
            );

            const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_CHECKLIST(task._id), {
                todoChecklist: nextChecklist,
            });

            setTask(response.data?.task || task);
            setSuccess("Checklist updated successfully.");
        } catch (updateError) {
            setError(updateError.response?.data?.message || "Failed to update checklist");
        } finally {
            setSaving(false);
        }
    };

    const assignedPeople = Array.isArray(task?.assignedTo)
        ? task.assignedTo
        : task?.assignedTo
            ? [task.assignedTo]
            : [];

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        <FiArrowLeft />
                        Back
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

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center text-sm text-slate-400">
                        Loading task details...
                    </div>
                ) : task ? (
                    <>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Task details</p>
                                    <h1 className="mt-2 text-3xl font-semibold text-white">{task.title}</h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{task.description}</p>
                                </div>

                                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold capitalize ${statusColors[String(task.status || "pending").toLowerCase()] || statusColors.pending}`}>
                                    <FiClock />
                                    {task.status || "Pending"}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Priority</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{task.priority || "Medium"}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Due date</p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {task.dueDate ? moment(task.dueDate).format("MMM D, YYYY") : "No due date"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Progress</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{progress}%</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Updated</p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {task.updatedAt ? moment(task.updatedAt).fromNow() : "Recently"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
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
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Checklist</h2>
                                        <p className="mt-1 text-sm text-slate-400">Toggle each item to update task progress.</p>
                                    </div>
                                    <FiCheckCircle className="text-lg text-cyan-300" />
                                </div>

                                <div className="mt-5 space-y-3">
                                    {checklist.length ? (
                                        checklist.map((item, index) => (
                                            <button
                                                key={`${item.text}-${index}`}
                                                type="button"
                                                onClick={() => updateChecklist(index)}
                                                disabled={saving}
                                                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:opacity-60 ${
                                                    item.completed
                                                        ? "border-emerald-400/20 bg-emerald-400/10"
                                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                                }`}
                                            >
                                                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${item.completed ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-white/20 text-slate-400"}`}>
                                                    {item.completed ? "✓" : index + 1}
                                                </span>
                                                <span className={`flex-1 text-sm ${item.completed ? "text-emerald-100 line-through" : "text-slate-200"}`}>
                                                    {item.text}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                                            No checklist items defined for this task.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                                    <h2 className="text-xl font-semibold text-white">Assigned members</h2>
                                    <div className="mt-4 space-y-3">
                                        {assignedPeople.length ? (
                                            assignedPeople.map((person) => (
                                                <div key={person._id || person.email} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                    <p className="font-semibold text-white">{person.name || person.email || "Member"}</p>
                                                    <p className="mt-1 text-sm text-slate-400">{person.email || "No email available"}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                                                This task is not assigned to a member.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-linear-to-br from-cyan-500/10 via-blue-500/10 to-slate-900 p-5">
                                    <h2 className="text-xl font-semibold text-white">Task activity</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        Open this screen to understand the task state and keep checklist completion in sync with progress.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-10 text-center text-sm text-slate-400">
                        Task not found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTaskDetails;

