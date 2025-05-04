import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import PizzaDashboard from './pages/pizza/pizza_dashboard/pizza_dashboard';
import Add from './pages/pizza/add/add_pizza';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import GetAll from './pages/pizza/getall/getAll';
import UpdatePizza from './pages/pizza/update/update_pizza';
import UserDashboard from './pages/user/user_dasboard/user_dashboard';
import UserUpdate from './pages/user/user_update/user_update';
import Home from './pages/customer/home';
import AdminLogin from './components/admin_login/admin_login';
import UserNavbar from './components/user_navbar/user_navbar';
import Contact from './pages/contact/contact';
import ExploreMenu from './components/explore_menu/explore_menu';
import Footer from './components/Footer/Footer';
import InventoryDashboard from './pages/inventory/inventory_dashboard/inventory';
import UpdateInventory from './pages/inventory/update_inventory/update_inventory';

const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // Check if token exists
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/admin_login" />;
};

const App = () => {
  const location = useLocation(); // Get the current route

  // Check if the current route starts with "/admin"
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isContactRoute = location.pathname === '/contact'; // Check if the route is /contact

  return (
    <div className={isContactRoute ? 'contact-page' : ''}> {/* Apply class conditionally */}
      <ToastContainer />
      {isAdminRoute && <Navbar />} {/* Render Navbar only on /admin routes */}
      {!isAdminRoute && <UserNavbar />} {/* Render Navbar only on /home routes */}
      <hr />
      <div>
        <Routes>
          {/* Frontend */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order" element={<h1>Orders</h1>} />
          <Route path="/menu" element={<ExploreMenu/>} />
          <Route path="/register" element={<h1>Register</h1>} />
          <Route path="/login" element={<h1>Login</h1>} />

          {/* admin */}
          <Route path="/admin_login" element={<AdminLogin />} />
          <Route path="/admin">
            <Route index element={<ProtectedRoute><h1>Admin Dashboard</h1></ProtectedRoute>} />
            <Route path="pizza_dashboard" element={<ProtectedRoute><PizzaDashboard /></ProtectedRoute>} />
            <Route path="pizza_dashboard/add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
            <Route path="pizza_dashboard/get" element={<ProtectedRoute><GetAll /></ProtectedRoute>} />
            <Route path="pizza_dashboard/update/:id" element={<ProtectedRoute><UpdatePizza /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="user/user/:id" element={<ProtectedRoute><UserUpdate /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute><InventoryDashboard/></ProtectedRoute>} /> 
            <Route path="inventory/update" element={<ProtectedRoute><UpdateInventory/></ProtectedRoute>} />         
          </Route>
        </Routes>
        {!isAdminRoute && <Footer/>} {/* Render Footer only on non-admin routes */}
      </div>
    </div>
  ); 
};

export default App;