import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiClipboard,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";

const STATUS_COLORS = {
  all: "#2563eb",
  pending: "#f59e0b",
  Inprogress: "#8b5cf6",
  completed: "#10b981",
  overdue: "#ef4444",
};

const PIE_COLORS = ["#2563eb", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444"];

const formatLabel = (value) => {
  if (!value) return "Unknown";

  const normalized = String(value).replace(/[-_]/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeChartObject = (chartObject = {}) =>
  Object.entries(chartObject).map(([name, value]) => ({
    name: formatLabel(name),
    value: Number(value) || 0,
  }));

const formatTaskStatus = (status) => {
  if (!status) return "Pending";

  if (status.toLowerCase() === "in-progress") return "In Progress";

  return formatLabel(status);
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    statistics: {},
    charts: {},
    recentTasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);

        if (!isMounted) return;

        setDashboardData({
          statistics: response.data?.statistics || {},
          charts: response.data?.charts || {},
          recentTasks: response.data?.recentTasks || [],
        });
      } catch (fetchError) {
        if (!isMounted) return;

        setError(
          fetchError.response?.data?.message ||
            "Unable to load dashboard data right now."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statistics = dashboardData.statistics || {};
  const chartDistribution = normalizeChartObject(dashboardData.charts?.taskDistribution);
  const priorityDistribution = normalizeChartObject(dashboardData.charts?.taskPriorityLevels);

  const statCards = [
    {
      title: "Total Tasks",
      value: statistics.totalTasks || 0,
      icon: <FiClipboard />,
      accent: "from-blue-500 to-indigo-600",
      description: "Workspace-wide workload",
    },
    {
      title: "Completed",
      value: statistics.completedTasks || 0,
      icon: <FiCheckCircle />,
      accent: "from-emerald-500 to-teal-600",
      description: "Finished and delivered",
    },
    {
      title: "Pending",
      value: statistics.pendingTasks || 0,
      icon: <FiClock />,
      accent: "from-amber-500 to-orange-600",
      description: "Waiting to start",
    },
    {
      title: "Overdue",
      value: statistics.overdueTasks || 0,
      icon: <FiTrendingUp />,
      accent: "from-rose-500 to-red-600",
      description: "Needs immediate attention",
    },
  ];

  const lineData = [
    {
      name: "Open",
      value: statistics.pendingTasks || 0,
    },
    {
      name: "Active",
      value: statistics.totalTasks ? Math.max((statistics.totalTasks || 0) - (statistics.completedTasks || 0), 0) : 0,
    },
    {
      name: "Done",
      value: statistics.completedTasks || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <FiLayers className="text-sm" />
              Admin Workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Task operations at a glance
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Monitor delivery health, spot blockers, and keep the team moving with a dashboard that feels like a real SaaS control center.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/create-tasks")}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <FiPlus />
              Create Task
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/tasks")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <FiArrowUpRight />
              Manage Tasks
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-300">{item.title}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{loading ? "--" : item.value}</h2>
                </div>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${item.accent} text-lg text-white shadow-lg`}>
                  {item.icon}
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Task Distribution</h2>
                <p className="mt-1 text-sm text-slate-400">Status breakdown across the workspace</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="min-h-80 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                {loading ? (
                  <div className="flex h-70 items-center justify-center text-sm text-slate-400">
                    Loading chart data...
                  </div>
                ) : chartDistribution.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={chartDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={98}
                        paddingAngle={5}
                      >
                        {chartDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "16px",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-70 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                    No chart data available
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Priority Mix</h3>
                  <div className="mt-4 min-h-45">
                    {loading ? (
                      <div className="flex h-45 items-center justify-center text-sm text-slate-400">Loading priorities...</div>
                    ) : priorityDistribution.length ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={priorityDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "16px",
                            }}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#38bdf8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-45 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                        No priority data available
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Delivery Trend</h3>
                  <div className="mt-4 min-h-45">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "16px",
                          }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
                <p className="mt-1 text-sm text-slate-400">Latest items coming through the pipeline</p>
              </div>
              <FiCalendar className="text-lg text-cyan-300" />
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                  Loading recent tasks...
                </div>
              ) : dashboardData.recentTasks.length ? (
                dashboardData.recentTasks.map((task) => {
                  const dueDate = task.dueDate ? moment(task.dueDate).format("MMM D, YYYY") : "No due date";
                  const createdAt = task.createdAt ? moment(task.createdAt).fromNow() : "Recently";

                  return (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-white">{task.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
                            {task.description || "No description provided."}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                          {formatTaskStatus(task.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          Priority: <span className="font-semibold text-slate-200">{formatLabel(task.priority)}</span>
                        </div>
                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          Due: <span className="font-semibold text-slate-200">{dueDate}</span>
                        </div>
                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          Updated: <span className="font-semibold text-slate-200">{createdAt}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                  No recent tasks found.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-linear-to-br from-cyan-400/10 via-blue-500/10 to-indigo-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                  <FiArrowUpRight />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Next action</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Review overdue work, create the next task batch, or jump into the task table for edits and status updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;