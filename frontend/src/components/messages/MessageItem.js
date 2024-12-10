import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/messages.css';

function MessageItem({ message, channelId }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(message.reactions || []);

  // Parse image URLs in message content
  const renderContent = () => {
    const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|gif|png))/gi;
    const parts = message.content.split(urlRegex);
    const matches = message.content.match(urlRegex) || [];

    return (
      <>
        {parts.map((part, i) => (
          matches.includes(part) ? 
            <img key={i} src={part} alt="" className="message-image" /> : 
            <span key={i}>{part}</span>
        ))}
      </>
    );
  };

  const addReaction = async (emoji) => {
    try {
      const response = await fetch(`/api/messages/${message.id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emoji })
      });
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    setShowReactions(false);
  };

  return (
    <div className="message-item">
      <div className="message-header">
        <span className="message-username">{message.username}</span>
        <span className="message-time">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
      <div className="message-content">{renderContent()}</div>
      
      <div className="message-actions">
        <button 
          className="reaction-button"
          onClick={() => setShowReactions(!showReactions)}
        >
          😀
        </button>
        <Link 
          to={`/channels/${channelId}/thread/${message.id}`}
          className="reply-button"
        >
          💬 {message.reply_count > 0 && <span>{message.reply_count}</span>}
        </Link>
      </div>

      {showReactions && (
        <div className="reaction-picker">
          {['👍', '❤️', '😂', '🎉', '🤔', '👀'].map(emoji => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="reaction-option"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="message-reactions">
        {reactions.map(reaction => (
          <span 
            key={reaction.emoji}
            className="reaction-badge"
            title={`${reaction.users?.join(', ')}`}
          >
            {reaction.emoji} {reaction.count}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MessageItem;