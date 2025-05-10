import React, { useEffect, useState } from 'react';
import './order_manage.css';
import { toast } from 'react-toastify';

const OrderManage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authorization token is missing. Please log in again.');
                return;
            }

            const response = await fetch('https://pizzacraft-backend.vercel.app/order/get_orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please log in again.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders);
        } catch (err) {
            console.error('Error fetching orders:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const updateOrderStatus = async (orderId, status) => {
        try {
            console.log('Updating order ID:', orderId); // Debugging
            console.log('New status:', status); // Debugging
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authorization token is missing. Please log in again.');
                return;
            }

            const response = await fetch('https://pizzacraft-backend.vercel.app/order/update_order/' + orderId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order status');
            }

            toast.success('Order status updated successfully.');
            fetchOrders(); // Refresh the orders list
        } catch (err) {
            console.error('Error updating order status:', err.message);
            toast.error(err.message);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            console.log('Deleting order ID:', orderId); // Debugging
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authorization token is missing. Please log in again.');
                return;
            }

            const response = await fetch('https://pizzacraft-backend.vercel.app/order/cancel_order/' + orderId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete order');
            }

            toast.success('Order deleted successfully.');
            fetchOrders(); // Refresh the orders list
        } catch (err) {
            console.error('Error deleting order:', err.message);
            toast.error(err.message);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="order-manage-container">
            <h1>Order Management</h1>
            <table className="order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User Info</th>
                        <th>Items</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>
                                <div>Name: {order.userId.name}</div>
                                <div>Email: {order.userId.email}</div>
                            </td>
                            <td>
                                <div>Base: {order.base}</div>
                                <div>Sauce: {order.sauce}</div>
                                <div>Cheese: {order.cheese}</div>
                                <div>Veggies: {order.veggies.join(', ') || 'None'}</div>
                                {order.pizzaId && (
                                    <div>
                                        Pizza: {order.pizzaId.name} - Rs {order.pizzaId.price}
                                    </div>
                                )}
                            </td>
                            <td>Rs {(order.totalAmount / 100).toFixed(2)}</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                >
                                    <option value="Order Received">Order Received</option>
                                    <option value="In the Kitchen">In the Kitchen</option>
                                    <option value="Sent to Delivery">Sent to Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </td>
                            <td className="action-buttons">
                                <button onClick={() => deleteOrder(order._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManage;