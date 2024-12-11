import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Layout from './components/layout/Layout';
import ChannelView from './components/channels/ChannelView';
import ReplyThread from './components/messages/ReplyThread';
import './styles/layout.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('tianyuec_belay_auth_token')
  );

  useEffect(() => {
    console.log('Auth state changed:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <>
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
                <Layout setIsAuthenticated={setIsAuthenticated}>
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
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;