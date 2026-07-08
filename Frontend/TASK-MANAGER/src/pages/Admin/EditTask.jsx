import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const emptyChecklistItem = () => ({
  text: "",
  completed: false,
});

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
    attachments: [],
    todoChecklist: [emptyChecklistItem()],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [taskResponse, usersResponse] = await Promise.all([
          axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id)),
          axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS),
        ]);

        if (!isMounted) return;

        const task = taskResponse.data || {};
        const checklist = Array.isArray(task.todoChecklist || task.todochecklist)
          ? task.todoChecklist || task.todochecklist
          : [];

        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setFormData({
          title: task.title || "",
          description: task.description || "",
          priority: String(task.priority || "medium").toLowerCase(),
          dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
          assignedTo: Array.isArray(task.assignedTo)
            ? task.assignedTo.map((user) => user?._id).filter(Boolean)
            : [],
          attachments: Array.isArray(task.attachments) ? task.attachments : [],
          todoChecklist: checklist.length ? checklist : [emptyChecklistItem()],
        });
      } catch (fetchError) {
        if (!isMounted) return;
        setError(fetchError.response?.data?.message || "Failed to load task");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleAssignedToChange = (event) => {
    const options = Array.from(event.target.selectedOptions).map((option) => option.value);
    setFormData((previous) => ({
      ...previous,
      assignedTo: options,
    }));
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

  const handleAttachmentChange = (index, value) => {
    setFormData((previous) => {
      const nextAttachments = [...previous.attachments];
      nextAttachments[index] = value;

      return {
        ...previous,
        attachments: nextAttachments,
      };
    });
  };

  const addChecklistItem = () => {
    setFormData((previous) => ({
      ...previous,
      todoChecklist: [...previous.todoChecklist, emptyChecklistItem()],
    }));
  };

  const addAttachment = () => {
    setFormData((previous) => ({
      ...previous,
      attachments: [...previous.attachments, ""],
    }));
  };

  const removeChecklistItem = (index) => {
    setFormData((previous) => ({
      ...previous,
      todoChecklist: previous.todoChecklist.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeAttachment = (index) => {
    setFormData((previous) => ({
      ...previous,
      attachments: previous.attachments.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

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
            completed: Boolean(item.completed),
          }))
          .filter((item) => item.text),
      };

      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(id), payload);
      setSuccess("Task updated successfully.");

      setTimeout(() => {
        navigate("/admin/tasks");
      }, 700);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const selectedUsers = users.filter((user) => formData.assignedTo.includes(user._id));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Task management</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Edit task</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Update the task details, team assignment, checklist, and attachments.
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

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-10 text-center text-sm text-slate-400">
            Loading task...
          </div>
        ) : (
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
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
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
                    <p className="mt-1 text-sm text-slate-400">Update the steps required to finish the task.</p>
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
                        className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
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
                    <p className="mt-1 text-sm text-slate-400">Store file URLs for the updated task.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Add Link
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {formData.attachments.length ? formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950 p-3">
                      <input
                        type="text"
                        value={attachment}
                        onChange={(event) => handleAttachmentChange(index, event.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                      >
                        Remove
                      </button>
                    </div>
                  )) : (
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
                <p className="mt-1 text-sm text-slate-400">Select one or more teammates for the task.</p>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Members</label>
                  <select
                    multiple
                    value={formData.assignedTo}
                    onChange={handleAssignedToChange}
                    className="min-h-72 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="font-medium text-white">Selected members</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUsers.length ? selectedUsers.map((user) => (
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
                <h2 className="text-lg font-semibold text-white">Save changes</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Update the task and keep the board in sync for the team.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Update Task"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditTask;