import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import '../../styles/messages.css';

function ReplyThread() {
  const { channelId, messageId } = useParams();
  const [parentMessage, setParentMessage] = useState(null);
  const [replies, setReplies] = useState([]);
  const navigate = useNavigate();

  // Fetch parent message and replies
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`/api/messages/${messageId}/replies`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setReplies(data);
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
      }
    };

    fetchReplies();
    // Poll for new replies
    const pollInterval = setInterval(fetchReplies, 500);
    return () => clearInterval(pollInterval);
  }, [messageId]);

  return (
    <div className="reply-thread">
      <div className="thread-header">
        <button 
          className="close-thread"
          onClick={() => navigate(`/channels/${channelId}`)}
        >
          ✕
        </button>
        <h3>Thread</h3>
      </div>

      {parentMessage && (
        <div className="parent-message">
          <MessageItem message={parentMessage} channelId={channelId} />
        </div>
      )}

      <div className="replies-list">
        {replies.map(reply => (
          <MessageItem 
            key={reply.id} 
            message={reply}
            channelId={channelId}
          />
        ))}
      </div>

      <MessageInput channelId={channelId} replyTo={messageId} />
    </div>
  );
}

export default ReplyThread;