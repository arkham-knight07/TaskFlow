import React from 'react'
import {BrowserRouter as Router,Routes,Route,}from"react-router-dom";
import Dashboard from './pages/Admin/Dashboard';
import EditTask from './pages/Admin/EditTask';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import CreateTasks from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageTasks from './pages/Admin/ManageTasks';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';

import PrivateRoute from './routes/PrivateRoute';
import { Navigate } from 'react-router-dom';

const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
};


const App = () => {
  return (
    <div>
        <Router>
            <Routes> 
        <Route path="/" element={<RootRedirect />} />
        <Route path = "/login" element={<Login/>}/>
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
          <Route path= "/admin/dashboard" element={<Dashboard />}/>
          <Route path= "/admin/tasks" element={<ManageTasks />}/>
          <Route path= "/admin/tasks/edit/:id" element={<EditTask />}/>
          <Route path= "/admin/create-tasks" element={<CreateTasks />}/>
          <Route path= "/admin/users" element={<ManageUsers />}/>
          </Route>

           {/* User Routes */}
        <Route element={<PrivateRoute allowedRoles={["member"]}/>}>
          <Route path= "/user/dashboard" element={<UserDashboard />}/>
          <Route path= "/user/tasks" element={<MyTasks />}/>
          <Route path= "/user/tasks-details/:id" element={<ViewTaskDetails />}/>
          </Route>

         </Routes>
        </Router>
    </div>
  );
};

export default App;