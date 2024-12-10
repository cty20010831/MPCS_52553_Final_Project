from flask import Flask, request, jsonify, make_response, g
from functools import wraps
import sqlite3
import random
import string
import bcrypt
import os

app = Flask(__name__)

# Database operations
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('db/database.sqlite3')
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = g.pop('_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    return (rows[0] if rows else None) if one else rows

# Generate a random session token
def generate_session_token():
    """Generate a random session token"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=64))

# Authentication decorator to validate session token
def auth_required(f):
    @wraps(f) 
    def decorated(*args, **kwargs):
        session_token = request.cookies.get('session_token')  # Get session token from cookies
        if not session_token:
            return jsonify({'message': 'No session token provided'}), 401
        
        user = query_db('SELECT * FROM users WHERE session_token = ?', [session_token], one=True)
        if not user:
            return jsonify({'message': 'Invalid session token'}), 401
                
        return f(user['id'], *args, **kwargs)
    
    return decorated

# API Routes
#################
# User profile operations
#################
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400
    
    try:
        # Hash the password before storing it
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Generate session token
        session_token = generate_session_token()
        
        # Insert new user with hashed password and session token
        query_db(
            'INSERT INTO users (username, password, session_token) VALUES (?, ?, ?)',
            [username, hashed_password.decode('utf-8'), session_token]
        )
        
        resp = jsonify({'message': 'Signup successful'})
        resp.set_cookie('session_token', session_token)  # Set session token in cookie
        return resp, 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Username already exists'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400
    
    # Find user by username
    user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    
    # Check if user exists and validate password
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        session_token = generate_session_token()  # Generate a new session token
        query_db('UPDATE users SET session_token = ? WHERE id = ?', [session_token, user['id']])  # Update session token in the database
        
        resp = jsonify({'message': 'Login successful'})
        resp.set_cookie('session_token', session_token)  # Set session token in cookie
        return resp, 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/profile', methods=['GET'])
@auth_required
def get_profile(user_id):
    user = query_db('SELECT id, username, created_at FROM users WHERE id = ?', [user_id], one=True)
    return jsonify(dict(user))

@app.route('/api/auth/profile', methods=['PUT'])
@auth_required
def update_profile(user_id):
    data = request.get_json()
    
    if 'username' in data:
        try:
            query_db('UPDATE users SET username = ? WHERE id = ?', [data['username'], user_id])
            return jsonify({'message': 'Profile updated'})
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Username already taken'}), 400
    
    return jsonify({'message': 'No changes provided'}), 400

@app.route('/api/auth/logout', methods=['POST'])
@auth_required
def logout(user_id):
    query_db('UPDATE users SET session_token = NULL WHERE id = ?', [user_id])  # Clear the session token in the database
    resp = jsonify({'message': 'Logout successful'})
    resp.set_cookie('session_token', '', expires=0)  # Clear the session token cookie
    return resp, 200

#################
# Channel management
#################
@app.route('/api/channels', methods=['GET'])
@auth_required
def get_channels(user_id):
    channels = query_db('SELECT * FROM channels')
    return jsonify([dict(channel) for channel in channels])

@app.route('/api/channels', methods=['POST'])
@auth_required
def create_channel(user_id):
    data = request.get_json()
    name = data.get("name")
    
    if not name:
        return jsonify({'message': 'Channel name required'}), 400
    
    try:
        query_db('INSERT INTO channels(name) VALUES (?)', [name])
        channel = query_db('SELECT * FROM channels WHERE name = ?', [name], one=True)
        return jsonify(dict(channel)), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Channel name already exists'}), 400

@app.route('/api/channels/<int:channel_id>', methods=['GET'])
@auth_required
def get_channel(user_id, channel_id):
    channel = query_db('SELECT * FROM channels WHERE id = ?', [channel_id], one=True)
    if channel:
        return jsonify(dict(channel))
    return jsonify({'message': 'Channel not found'}), 404

#################
# Messages
#################
@app.route('/api/channels/<int:channel_id>/messages', methods=['GET'])
@auth_required
def get_messages(user_id, channel_id):
    messages = query_db('''
        SELECT m.*, 
               u.username,
               (SELECT COUNT(*) FROM messages r WHERE r.replies_to = m.id) as reply_count
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.channel_id = ? 
        AND m.replies_to IS NULL
        ORDER BY m.created_at DESC
    ''', [channel_id])
    
    return jsonify([dict(message) for message in messages])

@app.route('/api/channels/<int:channel_id>/messages', methods=['POST'])
@auth_required
def post_message(user_id, channel_id):
    data = request.get_json()
    content = data.get('content')
    replies_to = data.get('replies_to')
    
    if not content:
        return jsonify({'message': 'Message content required'}), 400
    
    try:
        query_db(
            '''INSERT INTO messages 
               (user_id, channel_id, content, replies_to) 
               VALUES (?, ?, ?, ?)''',
            [user_id, channel_id, content, replies_to]
        )
        
        message = query_db('''
            SELECT m.*, u.username
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = last_insert_rowid()
        ''', one=True)
        
        return jsonify(dict(message)), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Invalid reply reference'}), 400

#################
# Message replies
#################
@app.route('/api/messages/<int:message_id>/replies', methods=['GET'])
@auth_required
def get_replies(user_id, message_id):
    replies = query_db('''
        SELECT m.*, u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.replies_to = ?
        ORDER BY m.created_at ASC
    ''', [message_id])
    
    return jsonify([dict(reply) for reply in replies])

@app.route('/api/messages/<int:message_id>/replies', methods=['POST'])
@auth_required
def post_reply(user_id, message_id):
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'message': 'Reply content required'}), 400
    
    try:
        # Get channel_id from original message
        original_message = query_db(
            'SELECT channel_id FROM messages WHERE id = ?',
            [message_id],
            one=True
        )
        
        if not original_message:
            return jsonify({'message': 'Original message not found'}), 404
            
        channel_id = original_message['channel_id']
        
        # Insert reply
        query_db(
            'INSERT INTO messages(user_id, channel_id, content, replies_to) VALUES (?, ?, ?, ?)',
            [user_id, channel_id, content, message_id]
        )
        
        # Get the inserted reply with user info
        reply = query_db('''
            SELECT m.*, u.username
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = last_insert_rowid()
        ''', one=True)
        
        return jsonify(dict(reply)), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Invalid reply reference'}), 400

#################
# Message reactions
#################
@app.route('/api/messages/<int:message_id>/reactions', methods=['POST'])
@auth_required
def add_reaction(user_id, message_id):
    data = request.get_json()
    emoji = data.get('emoji')

    if not emoji:
        return jsonify({'message': 'Reaction emoji required'}), 400
    
    try:
        message = query_db('SELECT id FROM messages WHERE id = ?', 
                         [message_id], one=True)
        if not message:
            return jsonify({'message': 'Message not found'}), 404

        query_db('''
            INSERT INTO reactions (user_id, message_id, emoji) 
            VALUES (?, ?, ?)
        ''', [user_id, message_id, emoji])
        
        reactions = query_db('''
            SELECT emoji, COUNT(*) as count
            FROM reactions
            WHERE message_id = ?
            GROUP BY emoji
        ''', [message_id])
        
        return jsonify({
            'message': 'Reaction added',
            'reactions': [dict(r) for r in reactions]
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Reaction already exists'}), 400

@app.route('/api/messages/<int:message_id>/reactions', methods=['DELETE'])
@auth_required
def remove_reaction(user_id, message_id):
    data = request.get_json()
    emoji = data.get('emoji')
    
    if not emoji:
        return jsonify({'message': 'Emoji required'}), 400
        
    query_db('''
        DELETE FROM reactions 
        WHERE user_id = ? AND message_id = ? AND emoji = ?
    ''', [user_id, message_id, emoji])
    
    reactions = query_db('''
        SELECT emoji, COUNT(*) as count
        FROM reactions
        WHERE message_id = ?
        GROUP BY emoji
    ''', [message_id])
    
    return jsonify({
        'message': 'Reaction removed',
        'reactions': [dict(r) for r in reactions]
    })

#################
# Read status management
#################
@app.route('/api/channels/unread', methods=['GET'])
@auth_required
def get_unread_counts(user_id):
    try:
        unread_counts = query_db('''
            SELECT 
                c.id as channel_id,
                c.name as channel_name,
                COUNT(DISTINCT CASE 
                    WHEN m.id > COALESCE(mr.last_read_message_id, 0) 
                    THEN m.id 
                    END
                ) as unread_count
            FROM channels c
            LEFT JOIN messages m ON c.id = m.channel_id
            LEFT JOIN message_reads mr ON c.id = mr.channel_id AND mr.user_id = ?
            GROUP BY c.id
        ''', [user_id])
        
        return jsonify([dict(count) for count in unread_counts])
        
    except Exception as e:
        print(f"Error getting unread counts: {e}")
        return jsonify({'error': 'Failed to get unread counts'}), 500

@app.route('/api/channels/<int:channel_id>/read', methods=['POST'])
@auth_required
def mark_channel_read(user_id, channel_id):
    latest_message = query_db('''
        SELECT id 
        FROM messages 
        WHERE channel_id = ? 
        ORDER BY id DESC LIMIT 1
    ''', [channel_id], one=True)
    
    if latest_message:
        query_db('''
            INSERT OR REPLACE INTO message_reads 
            (user_id, channel_id, last_read_message_id, last_read_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', [user_id, channel_id, latest_message['id']])
        
        return jsonify({
            'message': 'Channel marked as read',
            'last_read_message_id': latest_message['id']
        })
    
    return jsonify({'message': 'No messages in channel'})

if __name__ == '__main__':
    app.run(debug=True)