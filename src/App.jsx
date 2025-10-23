import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import MyTopicsPage from './pages/MyTopicsPage';
import TopicViewPage from './pages/TopicViewPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/my-topics" element={<MyTopicsPage />} />
      <Route path="/topic/:id" element={<TopicViewPage />} />
    </Routes>
  );
}

export default App;
