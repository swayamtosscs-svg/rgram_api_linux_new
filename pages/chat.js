import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import '../styles/chat.css';
import { useChat } from '../lib/hooks/useChat';

export default function ChatPage() {
  const router = useRouter();
  const { user: targetUserId, username: targetUsername } = router.query;
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // Use custom chat hook to prevent infinite loading
  const {
    messages,
    loading,
    error,
    fetchMessages,
    addMessage
  } = useChat();

  // Memoized function to fetch messages - prevents unnecessary re-renders
  const fetchMessagesForUser = useCallback(async (userId) => {
    if (!userId) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Use the custom hook's fetchMessages function
    await fetchMessages(userId, token);
  }, [router, fetchMessages]);

  // Memoized function to send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedUser,
          content: newMessage.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.success) {
        // Add new message to local state instead of refetching
        const newMsg = {
          _id: data.data.message._id,
          content: newMessage.trim(),
          sender: data.data.message.sender,
          recipient: data.data.message.recipient,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        
        // Use the custom hook's addMessage function
        addMessage(newMsg);
        setNewMessage('');
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  }, [newMessage, selectedUser, router]);

  // Memoized function to fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/users/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    }
  }, [router]);

  // Initialize component only once
  useEffect(() => {
    if (!isInitialized) {
      fetchUsers();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchUsers]);

  // Simulate online status updates
  useEffect(() => {
    if (users.length > 0) {
      const interval = setInterval(() => {
        const randomOnlineUsers = new Set();
        users.forEach(user => {
          if (Math.random() > 0.7) { // 30% chance of being online
            randomOnlineUsers.add(user._id);
          }
        });
        setOnlineUsers(randomOnlineUsers);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [users]);

  // Handle target user from URL parameters
  useEffect(() => {
    if (targetUserId && isInitialized) {
      setSelectedUser(targetUserId);
      fetchMessagesForUser(targetUserId);
    }
  }, [targetUserId, isInitialized, fetchMessagesForUser]);

  // Fetch messages only when selectedUser changes
  useEffect(() => {
    if (selectedUser && isInitialized) {
      fetchMessagesForUser(selectedUser);
    }
  }, [selectedUser, fetchMessagesForUser, isInitialized]);

  // Handle Enter key press
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
            <button
              onClick={() => router.push('/users-list')}
              className="text-purple-600 hover:text-purple-700 transition-colors"
              title="Find People"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user._id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedUser === user._id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Online Status Indicator */}
                  {onlineUsers.has(user._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName || user.username}
                    </p>
                    {onlineUsers.has(user._id) && (
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    )}
                  </div>
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
                  {users.find(u => u._id === selectedUser)?.fullName?.charAt(0).toUpperCase() || 
                   users.find(u => u._id === selectedUser)?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {users.find(u => u._id === selectedUser)?.fullName || 
                     users.find(u => u._id === selectedUser)?.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{users.find(u => u._id === selectedUser)?.username}
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
                    onClick={() => fetchMessagesForUser(selectedUser)}
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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-6">💬</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No messages yet</h3>
              <p className="text-gray-500 mb-6">Start a conversation with someone</p>
              <button
                onClick={() => router.push('/users-list')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Find People
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
