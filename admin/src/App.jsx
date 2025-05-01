import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import PizzaDashboard from './pages/pizza/pizza_dashboard/pizza_dashboard';
import Add from './pages/pizza/add/add_pizza';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import GetAll from './pages/pizza/getall/getAll';
import UpdatePizza from './pages/pizza/update/update_pizza';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr/>
      <div>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/pizza_dashboard" element={<PizzaDashboard />} />
          <Route path="/pizza_dashboard/add" element={<Add/>} />
          <Route path="/pizza_dashboard/get" element={<GetAll/>} />
          <Route path="/pizza_dashboard/update/:id" element={<UpdatePizza/>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;