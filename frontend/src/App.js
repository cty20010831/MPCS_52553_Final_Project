import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Layout from './components/layout/Layout';
import ChannelView from './components/channels/ChannelView';
import ReplyThread from './components/messages/ReplyThread';
import './styles/layout.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Separate component to handle location-based effects
function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('tianyuec_belay_auth_token')
  );

  useEffect(() => {
    console.log('Auth state changed:', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    // Update document title based on route and state
    if (location.pathname === '/') {
      document.title = 'Belay';
    } else if (location.state?.channelName) {
      document.title = `#${location.state.channelName} - Belay`;
    } else if (location.state?.parentMessageContent) {
      document.title = `Thread: ${location.state.parentMessageContent.substring(0, 30)}... - Belay`;
    }
  }, [location]);

  return (
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
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AppContent />
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