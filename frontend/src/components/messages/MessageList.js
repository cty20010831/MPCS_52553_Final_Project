import React, { useState, useEffect } from 'react';
import MessageItem from './MessageItem';
import '../../styles/messages.css';

function MessageList({ channelId }) {
  const [messages, setMessages] = useState([]);

  // Poll for new messages
  useEffect(() => {
    const pollMessages = setInterval(async () => {
      try {
        const response = await fetch(`/api/channels/${channelId}/messages`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }, 500);

    return () => clearInterval(pollMessages);
  }, [channelId]);

  return (
    <div className="message-list">
      {messages.map(message => (
        <MessageItem 
          key={message.id} 
          message={message}
          channelId={channelId}
        />
      ))}
    </div>
  );
}

export default MessageList;