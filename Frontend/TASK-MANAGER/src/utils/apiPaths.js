const BASE_URL = "https://taskflow-gj93.onrender.com";

export const API_PATHS = {

    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE: "/api/auth/profile",
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },

    TASKS: {
    GET_DASHBOARD_DATA: "/api/tasks/dashboard",

    GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",

    GET_ALL_TASKS: "/api/tasks/tasks",

    GET_TASK_BY_ID: (id) => `/api/tasks/${id}`,

    CREATE_TASK: "/api/tasks/",

    UPDATE_TASK: (id) => `/api/tasks/${id}`,

    DELETE_TASK: (id) => `/api/tasks/${id}`,

    UPDATE_STATUS: (id) => `/api/tasks/${id}/status`,

    UPDATE_CHECKLIST: (id) => `/api/tasks/${id}/todo`,
},

    USERS: {
        GET_ALL_USERS: "/api/users",
        GET_USER: (id) => `/api/users/${id}`,
    },

    REPORTS: {
        DOWNLOAD: "/api/reports/export",
    },
};

export default BASE_URL;