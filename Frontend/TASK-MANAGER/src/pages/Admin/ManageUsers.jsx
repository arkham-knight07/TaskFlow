import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { FiFilter, FiRefreshCw, FiSearch, FiUsers } from "react-icons/fi";

const roleTabs = [
    { label: "All Members", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);

                if (!isMounted) return;

                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (fetchError) {
                if (!isMounted) return;
                setError(fetchError.response?.data?.message || "Failed to load users");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch = !query
                ? true
                : [user.name, user.email, user.department, user.designation]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase()
                        .includes(query);

            const normalizedStatus = user.isActive ? "active" : "inactive";
            const matchesStatus = !statusFilter ? true : normalizedStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter, users]);

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-6 lg:p-8">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Team management</p>
                        <h1 className="mt-2 text-3xl font-semibold text-white">Manage users</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Review active members, track task ownership, and inspect the team directory from one place.
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

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-sm text-slate-400">Total members</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{users.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-sm text-slate-400">Active</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{users.filter((user) => user.isActive).length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                        <p className="text-sm text-slate-400">Department coverage</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{new Set(users.map((user) => user.department).filter(Boolean)).size}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative flex-1">
                            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search members"
                                className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                <FiFilter />
                                Status
                            </div>
                            {roleTabs.map((tab) => (
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

                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                            <thead className="bg-slate-950/60 text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Member</th>
                                    <th className="px-5 py-4 font-medium">Department</th>
                                    <th className="px-5 py-4 font-medium">Designation</th>
                                    <th className="px-5 py-4 font-medium">Tasks</th>
                                    <th className="px-5 py-4 font-medium">Last login</th>
                                    <th className="px-5 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/5">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-white">{user.name}</p>
                                                    <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">{user.department || "Not set"}</td>
                                            <td className="px-5 py-4 text-slate-300">{user.designation || "Not set"}</td>
                                            <td className="px-5 py-4 text-slate-300">
                                                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-200">Pending {user.pendingTasks ?? 0}</span>
                                                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">In Progress {user.inProgressTasks ?? 0}</span>
                                                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">Done {user.completedTasks ?? 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {user.lastLogin ? moment(user.lastLogin).fromNow() : "No recent login"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${user.isActive ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-slate-500/20 bg-slate-500/10 text-slate-300"}`}>
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-14 text-center text-slate-400">
                                            No users found.
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

export default ManageUsers;