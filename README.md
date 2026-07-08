# Task Manager Platform

A full-stack task management platform inspired by Jira, Trello, and Linear. It is designed as a portfolio-grade SaaS application for teams, startups, and students.

## Tech Stack

Frontend
- React + Vite
- React Router DOM v7
- Tailwind CSS
- Axios
- React Context API
- Recharts
- React Icons

Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- Multer

Testing
- Postman

## Project Structure

```text
Task-Manager/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
├── Frontend/
│   └── TASK-MANAGER/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── routes/
│       │   └── utils/
│       └── vite.config.js
└── package.json
```

## Features

Authentication
- Register, login, profile, and profile update
- JWT-based private routes
- Role-based access control

Admin Workspace
- Dashboard analytics
- Create task form
- Task management table
- User management list

Member Workspace
- Personal dashboard
- My tasks view
- Task detail screen
- Checklist progress updates

Reports
- Task export
- User-task export

Uploads
- Profile image upload support

## Setup

### 1) Install dependencies

From the project root:

```bash
npm install
cd Backend && npm install
cd ../Frontend/TASK-MANAGER && npm install
```

### 2) Configure environment variables

Create a `.env` file in `Backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
ADMIN_INVITE_TOKEN=your_optional_admin_token
CLIENT_URL=http://localhost:5173
```

### 3) Run the apps

Backend:

```bash
cd Backend
npm run dev
```

Frontend:

```bash
cd Frontend/TASK-MANAGER
npm run dev
```

From the repository root you can also use:

```bash
npm run dev:frontend
npm run dev:backend
```

## Available Scripts

Root
- `npm run dev` - start the frontend from the workspace root
- `npm run dev:frontend` - start the frontend
- `npm run dev:backend` - start the backend
- `npm run build` - build the frontend
- `npm run lint` - lint the frontend

Frontend
- `npm run dev` - start Vite
- `npm run build` - production build
- `npm run lint` - run ESLint

Backend
- `npm run dev` - start Express with nodemon
- `npm start` - start Express in production mode

## API Overview

Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/upload-image`

Tasks
- `GET /api/tasks/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks/`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PUT /api/tasks/:id/status`
- `PUT /api/tasks/:id/todo`
- `GET /api/tasks/dashboard`
- `GET /api/tasks/user-dashboard-data`

Users
- `GET /api/users/`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Reports
- `GET /api/reports/export/tasks`
- `GET /api/reports/export/users`

## Notes

- Uploaded files are served from `/uploads`.
- The frontend is a SaaS-style implementation and is not a Jira clone.
- Backend task status values are normalized so the current frontend and older stored data can coexist safely.