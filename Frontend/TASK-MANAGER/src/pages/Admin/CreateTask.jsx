import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const emptyChecklistItem = () => ({
    text: "",
    completed: false,
});

const CreateTask = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedTo: [],
        attachments: [],
        todoChecklist: [emptyChecklistItem()],
    });
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);

                if (!isMounted) return;

                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (fetchError) {
                if (!isMounted) return;
                setError(fetchError.response?.data?.message || "Failed to load users");
            } finally {
                if (isMounted) setLoadingUsers(false);
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    const assignedPreview = useMemo(() => {
        return users.filter((user) => formData.assignedTo.includes(user._id));
    }, [formData.assignedTo, users]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
        setError("");
        setMessage("");
    };

    const handleAssignedToChange = (event) => {
        const options = Array.from(event.target.selectedOptions).map((option) => option.value);
        setFormData((previous) => ({
            ...previous,
            assignedTo: options,
        }));
        setError("");
        setMessage("");
    };

    const handleChecklistChange = (index, value) => {
        setFormData((previous) => {
            const nextChecklist = [...previous.todoChecklist];
            nextChecklist[index] = {
                ...nextChecklist[index],
                text: value,
            };

            return {
                ...previous,
                todoChecklist: nextChecklist,
            };
        });
    };

    const addChecklistItem = () => {
        setFormData((previous) => ({
            ...previous,
            todoChecklist: [...previous.todoChecklist, emptyChecklistItem()],
        }));
    };

    const removeChecklistItem = (index) => {
        setFormData((previous) => {
            if (previous.todoChecklist.length === 1) {
                return previous;
            }

            return {
                ...previous,
                todoChecklist: previous.todoChecklist.filter((_, itemIndex) => itemIndex !== index),
            };
        });
    };

    const addAttachmentField = () => {
        setFormData((previous) => ({
            ...previous,
            attachments: [...previous.attachments, ""],
        }));
    };

    const updateAttachmentField = (index, value) => {
        setFormData((previous) => {
            const nextAttachments = [...previous.attachments];
            nextAttachments[index] = value;

            return {
                ...previous,
                attachments: nextAttachments,
            };
        });
    };

    const removeAttachmentField = (index) => {
        setFormData((previous) => ({
            ...previous,
            attachments: previous.attachments.filter((_, attachmentIndex) => attachmentIndex !== index),
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError("Task title is required");
            return false;
        }

        if (!formData.description.trim()) {
            setError("Task description is required");
            return false;
        }

        if (!formData.dueDate) {
            setError("Due date is required");
            return false;
        }

        if (!formData.assignedTo.length) {
            setError("Assign the task to at least one member");
            return false;
        }

        const checklistHasText = formData.todoChecklist.some((item) => item.text.trim());

        if (!checklistHasText) {
            setError("Add at least one checklist item");
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                dueDate: formData.dueDate,
                assignedTo: formData.assignedTo,
                attachments: formData.attachments.filter(Boolean),
                todoChecklist: formData.todoChecklist
                    .map((item) => ({
                        text: item.text.trim(),
                        completed: false,
                    }))
                    .filter((item) => item.text),
            };

            await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload);

            setMessage("Task created successfully.");
            setFormData({
                title: "",
                description: "",
                priority: "medium",
                dueDate: "",
                assignedTo: [],
                attachments: [],
                todoChecklist: [emptyChecklistItem()],
            });

            setTimeout(() => {
                navigate("/admin/tasks");
            }, 700);
        } catch (submitError) {
            setError(submitError.response?.data?.message || "Failed to create task");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6 lg:p-8">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Task management</p>
                        <h1 className="mt-2 text-3xl font-semibold text-white">Create a new task</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Define the work, assign teammates, add checklist items, and keep the execution path clear from the start.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/admin/tasks")}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Back to Tasks
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                            <h2 className="text-lg font-semibold text-white">Task details</h2>

                            <div className="mt-5 grid gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Finalize sprint backlog"
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Describe the expected outcome, context, and acceptance criteria."
                                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">Due date</label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Checklist</h2>
                                    <p className="mt-1 text-sm text-slate-400">Break the task into manageable steps.</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addChecklistItem}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Add Item
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {formData.todoChecklist.map((item, index) => (
                                    <div key={index} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950 p-3">
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(event) => handleChecklistChange(index, event.target.value)}
                                            placeholder={`Checklist item ${index + 1}`}
                                            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeChecklistItem(index)}
                                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Attachments</h2>
                                    <p className="mt-1 text-sm text-slate-400">Store file URLs for documents or reference assets.</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addAttachmentField}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Add Link
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {formData.attachments.length ? (
                                    formData.attachments.map((attachment, index) => (
                                        <div key={index} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950 p-3">
                                            <input
                                                type="text"
                                                value={attachment}
                                                onChange={(event) => updateAttachmentField(index, event.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeAttachmentField(index)}
                                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                                        No attachment links added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                            <h2 className="text-lg font-semibold text-white">Assign members</h2>
                            <p className="mt-1 text-sm text-slate-400">Select one or more teammates who should receive the task.</p>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-slate-300">Members</label>
                                <select
                                    multiple
                                    value={formData.assignedTo}
                                    onChange={handleAssignedToChange}
                                    disabled={loadingUsers}
                                    className="min-h-72 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                                >
                                    {loadingUsers ? (
                                        <option>Loading users...</option>
                                    ) : users.length ? (
                                        users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} - {user.email}
                                            </option>
                                        ))
                                    ) : (
                                        <option>No members available</option>
                                    )}
                                </select>
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                <p className="font-medium text-white">Selected members</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {assignedPreview.length ? assignedPreview.map((user) => (
                                        <span key={user._id} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                                            {user.name}
                                        </span>
                                    )) : (
                                        <span className="text-slate-500">No members selected</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-linear-to-br from-cyan-500/10 via-blue-500/10 to-slate-900 p-5">
                            <h2 className="text-lg font-semibold text-white">Submission</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                This task will be created with the current backend contract and appear in the admin task table after submission.
                            </p>

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {saving ? "Creating Task..." : "Create Task"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;