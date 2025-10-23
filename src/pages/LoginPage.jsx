import React from 'react';
import Login from '../components/Login';

function LoginPage() {
  const handleLogin = (token) => {
    // Handle login logic, e.g., redirect to dashboard
    window.location.href = '/dashboard';
  };

  const handleSwitchToSignup = () => {
    window.location.href = '/signup';
  };

  return <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />;
}

export default LoginPage;
