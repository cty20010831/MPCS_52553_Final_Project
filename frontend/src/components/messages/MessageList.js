import React from 'react';
import MessageItem from './MessageItem';
import '../../styles/messages.css';

function MessageList({ messages = [], channelId }) {
  // Add debug logs
  console.log('MessageList render:', { 
    messagesCount: messages.length, 
    messages: messages,
    channelId 
  });

  if (!messages.length) {
    return (
      <div className="message-list empty">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

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