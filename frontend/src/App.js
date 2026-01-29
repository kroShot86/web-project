import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAppointment from './pages/CreateAppointment';
import MyAppointments from './pages/MyAppointments';
import AdminPanel from './pages/AdminPanel';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/create-appointment" element={
                <PrivateRoute>
                  <CreateAppointment />
                </PrivateRoute>
              } />
              <Route path="/my-appointments" element={
                <PrivateRoute>
                  <MyAppointments />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
              } />
                <Route path="/admin/users" element={
                  <PrivateRoute>
                    <AdminUsers />
                  </PrivateRoute>
              } />
            </Routes>
          </Container>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;