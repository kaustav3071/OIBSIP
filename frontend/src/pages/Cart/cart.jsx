import React, { useState, useEffect } from "react";
import "./cart.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const url =  import.meta.env.VITE_API_URL; // Base URL for API requests
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [razorpayKey, setRazorpayKey] = useState("");

  // Create an Axios instance with a timeout
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000, // 10 seconds
  });

  // Fetch initial cart data and Razorpay key
  useEffect(() => {
      const fetchData = async () => {
          try {
              const profileResponse = await api.get("/user/profile", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              const userCart = profileResponse.data.user.cartData || [];
              console.log("Fetched cart in cart.jsx:", userCart);

              // Fetch inventory to recalculate prices
              const inventoryResponse = await api.get("/inventory");
              const inventory = inventoryResponse.data;

              const updatedCart = userCart.map(item => {
                  const basePrice = inventory?.bases[item.base]?.price || 0;
                  const saucePrice = inventory?.sauces[item.sauce]?.price || 0;
                  const cheesePrice = inventory?.cheeses[item.cheese]?.price || 0;
                  const veggiesPrice = (item.veggies || []).reduce((total, veggie) => {
                      return total + (inventory?.veggies[veggie]?.price || 0);
                  }, 0);

                  const defaultBasePrice = 40;
                  const defaultSaucePrice = 0;
                  const defaultCheesePrice = 30;
                  const defaultInventoryCost = defaultBasePrice + defaultSaucePrice + defaultCheesePrice;

                  const basePizzaPrice = Number(item.originalPrice) || Number(item.price) || 0;
                  let adjustedPrice = basePizzaPrice - defaultInventoryCost;
                  adjustedPrice += basePrice + saucePrice + cheesePrice + veggiesPrice;

                  return {
                      ...item,
                      basePrice,
                      saucePrice,
                      cheesePrice,
                      veggiesPrice,
                      price: adjustedPrice,
                      originalPrice: item.originalPrice || item.price,
                  };
              });

              console.log("Cart after price recalculation:", updatedCart);
              setCart(updatedCart);

              const keyResponse = await api.get("/payment/getkey", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              if (keyResponse.data.success) {
                  setRazorpayKey(keyResponse.data.key);
              } else {
                  throw new Error("Failed to fetch Razorpay key");
              }
          } catch (error) {
              console.error("Error fetching data:", error.message, error.response?.data, error.code);
              if (error.code === 'ECONNRESET') {
                  toast.error("Connection to server lost. Please check if the server is running.");
              } else if (error.response) {
                  toast.error(`Failed to load cart or payment key: ${error.response.data.message}`);
              } else {
                  toast.error("Failed to load cart or payment key. Please try again.");
              }
          }
      };
      fetchData();
  }, []);

  // Calculate total price whenever the cart changes
  useEffect(() => {
    const calculateTotalPrice = () => {
      const total = cart.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
      setTotalPrice(total);
    };
    calculateTotalPrice();
  }, [cart]);

  // Function to update cart in the backend
  const updateCartInBackend = async (updatedCart) => {
    try {
      const response = await api.put(
        "/user/update_cart",
        { cartData: updatedCart },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCart(response.data.cartData);
      toast.success("Cart updated successfully!");
    } catch (error) {
      console.error("Error updating cart:", error.message, error.response?.data, error.code);
      if (error.code === 'ECONNRESET') {
        toast.error("Connection to server lost. Please check if the server is running.");
      } else {
        toast.error("Failed to update cart.");
      }
    }
  };

  // Add item to cart
  const addToCart = (pizza) => {
    const updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex(item => item.pizzaId === pizza.pizzaId);

    if (existingItemIndex !== -1) {
      updatedCart[existingItemIndex].quantity += 1;
    } else {
        updatedCart.push({
            ...pizza,
            quantity: 1,
            originalPrice: pizza.price, // Add originalPrice
        });
    }

    setCart(updatedCart);
    updateCartInBackend(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (pizzaId) => {
    const updatedCart = [...cart];
    const existingItemIndex = updatedCart.findIndex(item => item.pizzaId === pizzaId);

    if (existingItemIndex !== -1) {
      updatedCart[existingItemIndex].quantity -= 1;
      if (updatedCart[existingItemIndex].quantity <= 0) {
        updatedCart.splice(existingItemIndex, 1);
      }
      setCart(updatedCart);
      updateCartInBackend(updatedCart);
    }
  };

  // Remove item completely from cart
  const removeItemCompletely = (pizzaId) => {
    const updatedCart = cart.filter(item => item.pizzaId !== pizzaId);
    setCart(updatedCart);
    updateCartInBackend(updatedCart);
  };

  // Function to place an order after payment
  const handlePlaceOrder = async (item, razorpayOrderId, paymentId) => {
    try {
      console.log("Creating order with razorpayOrderId:", razorpayOrderId);
      const orderData = {
        base: item.base,
        sauce: item.sauce,
        cheese: item.cheese,
        veggies: item.veggies,
        pizzaId: item.pizzaId,
        quantity: item.quantity,
        price: item.originalPrice,
        razorpayOrderId,
        paymentId,
      };

      const response = await api.post( 
        "/order/create_order",
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
      console.error("Error placing order:", error.message, error.response?.data, error.code);
      toast.error("Failed to place order.");
      throw error;
    }
  };

  // Handle checkout process with Razorpay payment
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (totalPrice <= 0) {
      toast.error("Total amount must be greater than 0.");
      return;
    }

    if (!razorpayKey) {
      console.error("Razorpay key is not available");
      toast.error("Payment system is not initialized. Please try again later.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to proceed with checkout.");
      navigate("/login");
      return;
    }

    try {
      console.log("Creating Razorpay order with amount:", totalPrice);
      // Step 1: Create Razorpay order
      const orderResponse = await api.post(
        "/payment/create-payment",
        { amount: totalPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!orderResponse.data.success) {
        throw new Error("Failed to create Razorpay order");
      }

      const { orderId, amount, currency } = orderResponse.data;
      console.log("Razorpay order created:", { orderId, amount, currency });

      // Step 2: Fetch user details for prefill
      const userResponse = await api.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = userResponse.data.user;

      // Step 3: Configure Razorpay payment options
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: "PizzaCraft",
        description: "Pizza Order Payment",
        image: "https://your-logo-url.com/logo.png",
        order_id: orderId,
        handler: async (response) => {
          try {
            // Step 4: Verify payment
            const verifyResponse = await api.post(
              "/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              // Step 5: Create orders after payment verification
              for (let i = 0; i < cart.length; i++) {
                await handlePlaceOrder(
                  cart[i],
                  response.razorpay_order_id,
                  response.razorpay_payment_id
                );
              }

              // Step 6: Clear the cart
              setCart([]);
              await updateCartInBackend([]);

              toast.success("All orders placed successfully!");
              navigate("/order");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Error verifying payment or placing orders:", error.message, error.response?.data, error.code);
            if (error.code === 'ECONNRESET') {
              toast.error("Connection to server lost during payment verification.");
            } else if (error.response) {
              toast.error(`Payment verification failed: ${error.response.data.message}`);
            } else {
              toast.error("Payment verification failed or orders could not be placed.");
            }
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: "1234567890", // Replace with user's phone number
        },
        theme: {
          color: "#FF6347",
        },
      };

      // Step 7: Open Razorpay payment modal
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', (response) => {
        toast.error("Payment failed. Please try again.");
      });
      paymentObject.open();
    } catch (error) {
      console.error("Error during checkout:", error.message, error.response?.data, error.code, error.response?.status);
      if (error.code === 'ECONNRESET') {
        toast.error("Connection to server lost. Please check if the server is running.");
      } else if (error.response) {
        toast.error(`Checkout failed: ${error.response.data.message || 'Unknown error'} (Status: ${error.response.status})`);
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timed out. Please check your server or network connection.");
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
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
                      src={`${url}/images/${item.pizzaImage}`}
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
                    <button onClick={() => addToCart(item)}>+</button>
                  </td>
                  <td> 
                    <button
                      className="remove-btn"
                      onClick={() => removeItemCompletely(item.pizzaId)}
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