import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../../utils/api';
import '../../styles/messages.css';

function MessageItem({ message, channelId, isReply = false }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(Array.isArray(message.reactions) ? message.reactions : []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Array.isArray(message.reactions)) {
      setReactions(message.reactions);
    }
  }, [message.reactions]);

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
      const response = await authFetch(`http://127.0.0.1:5000/api/messages/${message.id}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji })
      });
      
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add reaction');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      setError('Failed to add reaction');
    }
    setShowReactions(false);
  };

  const removeReaction = async (emoji) => {
    try {
      const response = await authFetch(`http://127.0.0.1:5000/api/messages/${message.id}/reactions`, {
        method: 'DELETE',
        body: JSON.stringify({ emoji })
      });
      
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove reaction');
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      setError('Failed to remove reaction');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      }) + ' at ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className={`message-item ${isReply ? 'message-reply' : ''}`}>
      <div className="message-header">
        <span className="message-username">{message.username}</span>
        <span className="message-time" title={new Date(message.created_at).toLocaleString()}>
          {formatTimestamp(message.created_at)}
        </span>
      </div>
      
      <div className="message-content">
        {renderContent()}
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="message-actions">
        <div className="action-buttons">
          {/* Add reaction button and Reply button in the same line */}
          <button 
            className="reaction-button"
            onClick={() => setShowReactions(!showReactions)}
            title="Add Reaction"
          >
            😊
          </button>

          <Link 
            to={`/channels/${channelId}/thread/${message.id}`}
            className="reply-button"
            title="Reply in Thread"
          >
            💬 {message.reply_count > 0 && <span className="reply-count">{message.reply_count}</span>}
          </Link>
        </div>

        {/* Emoji picker */}
        {showReactions && (
          <div className="reaction-picker">
            {['👍', '❤️', '😂', '🎉', '🤔', '👀', '👎'].map(emoji => (
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

        {/* Display existing reactions */}
        <div className="message-reactions">
          {reactions.map(reaction => (
            <button 
              key={reaction.emoji}
              onClick={() => removeReaction(reaction.emoji)}
              className="reaction-badge"
              title={`Reacted by:\n${reaction.users ? reaction.users.join('\n') : 'No users yet'}`}
            >
              {reaction.emoji} {reaction.count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MessageItem;