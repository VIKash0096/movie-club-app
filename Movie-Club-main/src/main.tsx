import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminPage from "./admin/AdminPage";
import AddAdmin from "./admin/Add-Admin"; 
import ManageMovie from "./admin/ManageMovie";
import ManageEmployee from "./admin/manage-employee/ManageEmployee";
import EmployeePage from './employee/EmployeePage'; 
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/add-admin" element={<AddAdmin />} />
        <Route path="/manage-movie" element={<ManageMovie />} />
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/manage-employee" element={<ManageEmployee />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
