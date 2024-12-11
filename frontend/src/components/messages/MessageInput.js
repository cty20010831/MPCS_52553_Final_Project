import React, { useState } from 'react';
import { authFetch } from '../../utils/api';
import '../../styles/messages.css';

function MessageInput({ channelId, replyTo = null }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!channelId && !replyTo) {
      setError('Channel ID is required');
      return;
    }

    try {
      const endpoint = replyTo 
        ? `http://127.0.0.1:5000/api/messages/${replyTo}/replies`
        : `http://127.0.0.1:5000/api/channels/${channelId}/messages`;

      const response = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ 
          content: message,
          channel_id: channelId
        })
      });

      if (response.ok) {
        setMessage('');
        setError('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input">
      {error && <div className="error-message">{error}</div>}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={replyTo ? "Reply to thread..." : "Type a message..."}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default MessageInput;