import React, { useState, useEffect } from "react";
import "./cart.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [totalPrice, setTotalPrice] = useState(0);
  const [ razorpayKey, setRazorpayKey] = useState("");

  // Calculate total price whenever the cart changes
  useEffect(() => {
    const calculateTotalPrice = () => {
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotalPrice(total);
    };
    calculateTotalPrice();
  }, [cart]);

  // Function to update cart in the backend
  const updateCartInBackend = async (updatedCart) => {
    try {
      const response = await axios.put(
        "http://localhost:4000/user/update_cart",
        { cartData: updatedCart },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      // Update the cart state with the response data
      setCart(response.data.cartData);
  
      // Update localStorage to keep the cart in sync
      localStorage.setItem("cart", JSON.stringify(response.data.cartData));
      console.log("Backend response:", response.data);
      toast.success("Cart updated successfully!");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart.");
    }
  };

  // Add item to cart
  const addToCart = (pizzaId) => {
    const updatedCart = { ...cart };
    updatedCart[pizzaId] = (updatedCart[pizzaId] || 0) + 1;
    setCart(updatedCart);
    updateCartInBackend(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (pizzaId) => {
    const updatedCart = { ...cart };
    if (updatedCart[pizzaId]) {
      updatedCart[pizzaId] -= 1;
      if (updatedCart[pizzaId] <= 0) {
        delete updatedCart[pizzaId];
      }
      setCart(updatedCart);
      updateCartInBackend(updatedCart);
    }
  };

  // Clear cart (e.g., after placing an order)
  const clearCart = async () => {
    const updatedCart = {};
    setCart(updatedCart);
    await updateCartInBackend(updatedCart);
  };

  // Function to place an order
  const handlePlaceOrder = async (item) => {
    try {
      const orderData = {
        pizzaId: item.pizzaId,
        base: item.base,
        sauce: item.sauce,
        cheese: item.cheese,
        veggies: item.veggies,
        quantity: item.quantity,
      };

      const response = await axios.post(
        "http://localhost:4000/order/create_order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Order placed successfully!");
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order.");
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      for (let i = 0; i < cart.length; i++) {
        await handlePlaceOrder(cart[i]); // Place each order
      }

      // Clear the cart after all orders are placed
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      toast.success("All orders placed successfully!");

      // Redirect to the order confirmation page
      navigate("/order");
    } catch (error) {
      toast.error("Some orders failed to process. Please try again.");
    }
  };

  return (
    <div className="cart">
      <h1>Your Cart</h1>
      {cart.length > 0 ? (
        <div className="cart-items">
          <table>
            <thead>
              <tr>
                <th>Pizza</th>
                <th>Base</th>
                <th>Sauce</th>
                <th>Cheese</th>
                <th>Veggies</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={`http://localhost:4000/images/${item.pizzaImage}`}
                      alt={item.pizzaName}
                    />
                    {item.pizzaName}
                  </td>
                  <td>{item.base}</td>
                  <td>{item.sauce}</td>
                  <td>{item.cheese}</td>
                  <td>{item.veggies.join(", ") || "None"}</td>
                  <td>
                    <button
                      onClick={() => removeFromCart(item.pizzaId)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    {item.quantity}
                    <button onClick={() => addToCart(item.pizzaId)}>+</button>
                  </td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.pizzaId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}

      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <h2 style={{ color: "black" }}>Total Price: Rs {totalPrice}</h2>
        <button className="checkout" onClick={() => navigate("/add-inventory")}>
          Customize Pizzas
        </button>
        <button className="checkout" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;