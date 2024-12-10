import React, { useState } from 'react';
import '../../styles/messages.css';

function MessageInput({ channelId, replyTo = null }) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: message,
          replies_to: replyTo
        })
      });

      if (response.ok) {
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input">
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