import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import MyTopicsPage from './pages/MyTopicsPage';
import TopicViewPage from './pages/TopicViewPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/my-topics" element={<ProtectedRoute><MyTopicsPage /></ProtectedRoute>} />
          <Route path="/topic/:id" element={<ProtectedRoute><TopicViewPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
