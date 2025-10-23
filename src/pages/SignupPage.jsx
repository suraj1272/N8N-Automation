import React from 'react';
import Signup from '../components/Signup';

function SignupPage() {
  const handleSignup = (token) => {
    // Handle signup logic, e.g., redirect to dashboard
    window.location.href = '/dashboard';
  };

  const handleSwitchToLogin = () => {
    window.location.href = '/login';
  };

  return <Signup onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />;
}

export default SignupPage;
