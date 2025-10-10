import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/chat.css';

export default function UsersListPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    fetchUsers();
    
    // Simulate online status updates (in a real app, this would be WebSocket)
    const interval = setInterval(() => {
      // Randomly set some users as online
      const randomOnlineUsers = new Set();
      users.forEach(user => {
        if (Math.random() > 0.7) { // 30% chance of being online
          randomOnlineUsers.add(user._id);
        }
      });
      setOnlineUsers(randomOnlineUsers);
    }, 5000);

    return () => clearInterval(interval);
  }, [users]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/search?type=users&limit=100', {
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
        // Filter out current user from the list
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
        const otherUsers = data.data.users.filter(user => user._id !== currentUserId);
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      
      // Navigate to chat page with user ID
      router.push(`/chat?user=${userId}&username=${encodeURIComponent(username)}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError('Failed to start chat');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Find People to Chat</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredUsers.length} users found
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No users found' : 'No users available'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? `No users match "${searchQuery}". Try a different search term.`
                : 'There are no other users to chat with at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.fullName || user.username}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          (user.fullName || user.username).charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* Online Status Indicator */}
                      {onlineUsers.has(user._id) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.fullName || user.username}
                      </h3>
                      <p className="text-gray-600">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{user.postsCount || 0} Posts</span>
                        <span>{user.followersCount || 0} Followers</span>
                        <span>{user.followingCount || 0} Following</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Button */}
                  <button
                    onClick={() => startChat(user._id, user.username)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
