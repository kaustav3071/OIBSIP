import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';

const App = () => {
  return (
    <div>
      <Navbar />
      <hr/>
      <div>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;