import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./order_confirmation.css";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = localStorage.getItem("name") || "Guest";

  // Fetch orders for the current user
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:4000/order/get_orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const fetchedOrders = response.data.orders;
        setOrders(fetchedOrders);
        if (fetchedOrders.length === 0) {
          toast.info("No orders found.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again.");
        toast.error("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="order-confirmation">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation">
        <h1>Error</h1>
        <p>{error}</p>
        <button
          className="order-confirmation-button"
          onClick={() => navigate("/menu")}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <h1>Your Orders</h1>
      <p>Here are your recent orders and their statuses.</p>

      {orders.length > 0 ? (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pizza</th>
                <th>Base</th>
                <th>Sauce</th>
                <th>Cheese</th>
                <th>Veggies</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.pizzaId?.name || "Custom Pizza"}</td>
                  <td>{order.base} (Rs {order.basePrice})</td>
                  <td>{order.sauce} (Rs {order.saucePrice})</td>
                  <td>{order.cheese} (Rs {order.cheesePrice / 100})</td>
                  <td>{order.veggies.join(", ") || "None"} (Rs {order.veggiesPrice})</td>
                  <td>{order.quantity}</td>
                  <td>Rs {order.totalAmount / 100}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No orders found.</p>
      )}

      <button
        className="order-confirmation-button"
        onClick={() => navigate("/menu")}
      >
        Back to Menu
      </button>
    </div>
  );
};

export default OrderConfirmation;