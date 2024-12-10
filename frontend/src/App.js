import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Layout from './components/layout/Layout';
import ChannelView from './components/channels/ChannelView';
import ReplyThread from './components/messages/ReplyThread';
import './styles/layout.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status when app loads
    fetch('/api/auth/profile', {
      credentials: 'include'
    })
    .then(response => {
      setIsAuthenticated(response.ok);
      setIsLoading(false);
    })
    .catch(() => {
      setIsAuthenticated(false);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Signup setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/channels/:channelId" element={<ChannelView />} />
                  <Route path="/channels/:channelId/thread/:messageId" element={<ReplyThread />} />
                  <Route path="/" element={<div className="welcome-message">Select a channel to start messaging</div>} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;