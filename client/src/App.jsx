import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import { Layout } from './pages/layout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor/:roomId" element={<Layout />} />
      </Routes>
    </Router>
  );
};

export default App;

