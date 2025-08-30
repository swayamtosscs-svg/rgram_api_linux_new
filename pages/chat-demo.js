import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/chat.css';

export default function ChatDemo() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Demo users
  const demoUsers = [
    { _id: 'user1', username: 'john_doe', fullName: 'John Doe' },
    { _id: 'user2', username: 'jane_smith', fullName: 'Jane Smith' },
    { _id: 'user3', username: 'bob_wilson', fullName: 'Bob Wilson' }
  ];

  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser] = useState({ _id: 'current', username: 'you', fullName: 'You' });

  // Simulate loading messages (no infinite loop)
  const loadMessages = useCallback(async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo messages
    const demoMessages = [
      {
        _id: `msg1_${userId}`,
        content: 'Hi there! How are you?',
        sender: userId,
        recipient: 'current',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: true
      },
      {
        _id: `msg2_${userId}`,
        content: 'I\'m doing great, thanks for asking!',
        sender: 'current',
        recipient: userId,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        isRead: true
      },
      {
        _id: `msg3_${userId}`,
        content: 'That\'s wonderful to hear!',
        sender: userId,
        recipient: 'current',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        isRead: false
      }
    ];
    
    setMessages(demoMessages);
    setLoading(false);
  }, []);

  // Initialize only once
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Load messages only when user changes
  useEffect(() => {
    if (selectedUser && isInitialized) {
      loadMessages(selectedUser);
    }
  }, [selectedUser, loadMessages, isInitialized]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedUser) return;

    const newMsg = {
      _id: `msg_${Date.now()}`,
      content: newMessage.trim(),
      sender: 'current',
      recipient: selectedUser,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [newMessage, selectedUser]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return '1d ago';
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Demo Chat</h2>
          <p className="text-sm text-gray-500 mt-1">Select a user to start chatting</p>
        </div>
        <div className="overflow-y-auto h-full">
          {demoUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user._id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedUser === user._id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {demoUsers.find(u => u._id === selectedUser)?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {demoUsers.find(u => u._id === selectedUser)?.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{demoUsers.find(u => u._id === selectedUser)?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">
                  <p>Error: {error}</p>
                  <button 
                    onClick={() => loadMessages(selectedUser)}
                    className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Retry
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === selectedUser ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === selectedUser
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-purple-500 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === selectedUser ? 'text-gray-500' : 'text-purple-100'
                      }`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg">Select a user to start chatting</p>
              <p className="text-sm mt-2">This is a demo - no real messages are sent</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
