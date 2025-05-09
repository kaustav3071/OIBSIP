import React from "react";
import "./admin_dashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Kaustav! Manage your application efficiently.</p>
      </header>

      {/* Analytics Section */}
      <section className="dashboard-analytics">
        <div className="analytics-card">
          <h3>Total Users</h3>
          <p>1,245</p>
        </div>
        <div className="analytics-card">
          <h3>Total Orders</h3>
          <p>3,567</p>
        </div>
        <div className="analytics-card">
          <h3>Revenue</h3>
          <p>Rs 45,678</p>
        </div>
        <div className="analytics-card">
          <h3>Inventory Items</h3>
          <p>120</p>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Users</h2>
          <p>Manage all registered users.</p>
          <a href="/admin/users" className="dashboard-link">
            View Users
          </a>
        </div>
        <div className="dashboard-card">
          <h2>Pizzas</h2>
          <p>Manage pizza inventory and details.</p>
          <a href="/admin/pizza_dashboard" className="dashboard-link">
            Manage Pizzas
          </a>
        </div>
        <div className="dashboard-card">
          <h2>Orders</h2>
          <p>Track and manage customer orders.</p>
          <a href="/admin/orders" className="dashboard-link">
            View Orders
          </a>
        </div>
        <div className="dashboard-card">
          <h2>Inventory</h2>
          <p>Update and monitor inventory levels.</p>
          <a href="/admin/inventory" className="dashboard-link">
            Manage Inventory
          </a>
        </div>
      </div>

      {/* Quick Actions Section */}
      <section className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="actions-container">
            <a href="/admin/pizza_dashboard/add" className="action-button">
            Add New Pizza
            </a>
            <a href="/admin/generate_report" className="action-button">
            Generate Report
            </a>
        </div>
        </section>

      {/* Footer Section */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 PizzaCraft Admin Panel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;