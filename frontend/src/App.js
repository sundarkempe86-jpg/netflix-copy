import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return showRegister ? (
    <Register onLogin={() => setIsAuthenticated(true)} setShowRegister={setShowRegister} />
  ) : (
    <Login onLogin={() => setIsAuthenticated(true)} setShowRegister={setShowRegister} />
  );
}

export default App;
