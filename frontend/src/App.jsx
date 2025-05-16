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
import UserRegister from './components/user_register/user_register';
import UserLogin from './components/user_login/user_login';
import UserProfile from './components/user_profile/user_profile';
import AdminDashboard from './pages/admin_dashboard/admin_dashboard';
import Cart from './pages/Cart/cart';
import AddInventory from './components/Add_inventory/add_inventory';
import OrderConfirmation from './components/order_confirmation/order_confirmation';
import OrderManage from './pages/orders/order_manage';

const isAuthenticated = () => {
  return !!localStorage.getItem("token"); // Check if token exists
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/admin_login" />;
};

const UserProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  const location = useLocation(); // Get the current route

  // Check if the current route starts with "/admin"
  // and if the route is "/contact"
  // to conditionally render the Navbar and Footer
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
          <Route path="/contact" element={<UserProtectedRoute><Contact /></UserProtectedRoute>} />
          <Route path="/order" element={<UserProtectedRoute><OrderConfirmation/></UserProtectedRoute>} />
          <Route path="/menu" element={<UserProtectedRoute><ExploreMenu/></UserProtectedRoute>} />
          <Route path="/profile" element={<UserProtectedRoute><UserProfile/></UserProtectedRoute>} />
          <Route path="/register" element={<UserRegister/>} />
          <Route path="/login" element={<UserLogin/>} />
          <Route path="/cart" element={<UserProtectedRoute><Cart/></UserProtectedRoute>} />
          <Route path="/add-inventory" element={<UserProtectedRoute><AddInventory/></UserProtectedRoute>} />

          {/* admin */}
          <Route path="/admin_login" element={<AdminLogin />} />
          <Route path="/admin">
            <Route index element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>} />
            <Route path="pizza_dashboard" element={<ProtectedRoute><PizzaDashboard /></ProtectedRoute>} />
            <Route path="pizza_dashboard/add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
            <Route path="pizza_dashboard/get" element={<ProtectedRoute><GetAll /></ProtectedRoute>} />
            <Route path="pizza_dashboard/update/:id" element={<ProtectedRoute><UpdatePizza /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="user/user/:id" element={<ProtectedRoute><UserUpdate /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute><InventoryDashboard/></ProtectedRoute>} /> 
            <Route path="inventory/update" element={<ProtectedRoute><UpdateInventory/></ProtectedRoute>} />         
            <Route path="orders" element={<ProtectedRoute><OrderManage/></ProtectedRoute>} />
          </Route>
        </Routes>
        {!isAdminRoute && <Footer/>} {/* Render Footer only on non-admin routes */}
      </div>
    </div>
  ); 
};

export default App;