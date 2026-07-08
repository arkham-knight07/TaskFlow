# 🚀 TaskFlow - Full Stack Task Management Platform

TaskFlow is a full-stack task management platform . It helps teams assign tasks, track progress, and manage work efficiently through role-based dashboards.

---

# ✨ Features

## Authentication
- User Registration
- User Login
- JWT Authentication
- Role-Based Authorization (Admin / Member)
- Profile Management
- Profile Image Upload

## Admin
- Dashboard
- Create Tasks
- Manage Tasks
- Manage Users
- Assign Tasks
- Dashboard Analytics

## Member
- Personal Dashboard
- View Assigned Tasks
- Task Details
- Checklist Progress
- Update Task Status

## Backend
- REST APIs
- JWT Authentication
- MongoDB Database
- Image Upload using Multer

---

# 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router DOM v7
- Tailwind CSS
- Axios
- React Context API
- Recharts
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer

### Tools
- Postman
- Git
- GitHub

---

# 📁 Folder Structure

```text
TaskFlow
│
├── Backend
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── uploads
│   └── server.js
│
├── Frontend
│   └── TASK-MANAGER
│       ├── src
│       ├── public
│       └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend

```bash
cd Backend
npm install
npm run dev
```

---

## Frontend

```bash
cd Frontend/TASK-MANAGER
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside **Backend**

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET_KEY

ADMIN_INVITE_TOKEN=YOUR_ADMIN_TOKEN

CLIENT_URL=http://localhost:5173
```

---

# 📡 API Endpoints

## Authentication

POST `/api/auth/register`

POST `/api/auth/login`

GET `/api/auth/profile`

PUT `/api/auth/profile`

POST `/api/auth/upload-image`

---

## Tasks

GET `/api/tasks/tasks`

GET `/api/tasks/:id`

POST `/api/tasks/`

PUT `/api/tasks/:id`

DELETE `/api/tasks/:id`

PUT `/api/tasks/:id/status`

PUT `/api/tasks/:id/todo`

GET `/api/tasks/dashboard`

GET `/api/tasks/user-dashboard-data`

---

## Users

GET `/api/users`

GET `/api/users/:id`

PUT `/api/users/:id`

DELETE `/api/users/:id`

---

# 📌 Future Improvements

- Kanban Board
- Activity Timeline
- Comments
- Notifications
- Calendar View
- Team Analytics
- AI Task Assistant

---

# 👨‍💻 Author

**Shrestha Verdhan**
