import { useState, useEffect, useCallback, useRef } from 'react';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized fetch function to prevent infinite loops
  const fetchMessages = useCallback(async (threadId, token) => {
    if (!threadId || !token) return;

    // Prevent multiple simultaneous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/thread/${threadId}?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (data.success && isMountedRef.current) {
        setMessages(data.data.messages || []);
        setLastFetchTime(Date.now());
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Ignore aborted requests
      
      console.error('Error fetching messages:', err);
      if (isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Add new message to local state
  const addMessage = useCallback((message) => {
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(msg => msg._id === message._id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  // Update message (for edits, reactions, etc.)
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => 
      prev.map(msg => 
        msg._id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // Remove message (for deletions)
  const removeMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastFetchTime(null);
  }, []);

  // Check if we need to refetch (e.g., after a certain time interval)
  const shouldRefetch = useCallback((maxAge = 30000) => { // 30 seconds default
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > maxAge;
  }, [lastFetchTime]);

  return {
    messages,
    loading,
    error,
    lastFetchTime,
    fetchMessages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    shouldRefetch
  };
}
