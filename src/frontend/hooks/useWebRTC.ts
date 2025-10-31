import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCPeerManager } from '../../lib/webrtc/WebRTCPeerManager.js';
import { User, Message, PendingChange } from '../types/index.js';

interface UseWebRTCReturn {
  connected: boolean;
  currentUser: User | null;
  messages: Message[];
  onlineUsers: string[];
  pendingChanges: PendingChange[];
  login: (username: string, password: string) => Promise<void>;
  sendMessage: (message: string, channel?: string) => void;
  loadPendingChanges: () => void;
  approveChange: (changeId: number) => void;
  rejectChange: (changeId: number) => void;
  executeAIAction: (action: string, params: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function useWebRTC(): UseWebRTCReturn {
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const peerManagerRef = useRef<WebRTCPeerManager | null>(null);
  const tokenRef = useRef<string | null>(null);
  const messageSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages from API periodically (since WebRTC syncs new messages)
  const syncMessages = useCallback(async () => {
    if (!tokenRef.current) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages?channel=global&limit=50`, {
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`
        }
      });

      if (response.ok) {
        const { messages: apiMessages } = await response.json();
        setMessages(apiMessages);
      }
    } catch (error) {
      console.error('Failed to sync messages:', error);
    }
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      tokenRef.current = data.token;
      localStorage.setItem('gummybear_token', data.token);
      
      setCurrentUser(data.user);
      setConnected(true);

      // Initialize WebRTC peer manager
      const peerManager = new WebRTCPeerManager(data.token, API_BASE_URL);
      
      // Setup message handler
      peerManager.onMessage((from, message) => {
        if (message.type === 'chat-message') {
          setMessages(prev => [...prev, message]);
        }
      });

      // Setup peer connection handlers
      peerManager.onPeerConnect((peerId, username) => {
        setOnlineUsers(prev => {
          if (!prev.includes(username)) {
            return [...prev, username];
          }
          return prev;
        });
      });

      peerManager.onPeerDisconnect((peerId) => {
        // Update online users list
        syncMessages(); // Refresh to get updated user list
      });

      await peerManager.initialize();
      peerManagerRef.current = peerManager;

      // Start syncing messages
      await syncMessages();
      messageSyncTimerRef.current = setInterval(syncMessages, 5000);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [syncMessages]);

  // Send message
  const sendMessage = useCallback(async (message: string, channel: string = 'global') => {
    if (!tokenRef.current || !currentUser) return;

    try {
      // Send to server first (database)
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify({ message, channel })
      });

      if (response.ok) {
        const { message: msgData } = await response.json();
        
        // Add to local messages
        setMessages(prev => [...prev, msgData]);

        // Broadcast to connected peers via WebRTC
        if (peerManagerRef.current) {
          peerManagerRef.current.broadcastMessage({
            type: 'chat-message',
            ...msgData
          });
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [currentUser]);

  // Load pending changes
  const loadPendingChanges = useCallback(async () => {
    if (!tokenRef.current || currentUser?.role !== 'king') return;

    try {
      const response = await fetch(`${API_BASE_URL}/pending-changes`, {
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`
        }
      });

      if (response.ok) {
        const changes = await response.json();
        setPendingChanges(changes);
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  }, [currentUser]);

  // Approve change
  const approveChange = useCallback(async (changeId: number) => {
    if (!tokenRef.current) return;

    try {
      const response = await fetch(`${API_BASE_URL}/pending-changes/${changeId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`
        }
      });

      if (response.ok) {
        loadPendingChanges();
      }
    } catch (error) {
      console.error('Failed to approve change:', error);
    }
  }, [loadPendingChanges]);

  // Reject change
  const rejectChange = useCallback(async (changeId: number) => {
    if (!tokenRef.current) return;

    try {
      const response = await fetch(`${API_BASE_URL}/pending-changes/${changeId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenRef.current}`
        }
      });

      if (response.ok) {
        loadPendingChanges();
      }
    } catch (error) {
      console.error('Failed to reject change:', error);
    }
  }, [loadPendingChanges]);

  // Execute AI action
  const executeAIAction = useCallback(async (action: string, params: any) => {
    if (!tokenRef.current) return;

    try {
      const response = await fetch(`${API_BASE_URL}/ai/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify({ action, params })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('AI action result:', result);
      }
    } catch (error) {
      console.error('Failed to execute AI action:', error);
    }
  }, []);

  // Initialize from saved token
  useEffect(() => {
    const savedToken = localStorage.getItem('gummybear_token');
    if (savedToken) {
      tokenRef.current = savedToken;
      // Try to get user info from token
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        // Initialize peer manager with saved token
        const peerManager = new WebRTCPeerManager(savedToken, API_BASE_URL);
        peerManager.initialize();
        peerManagerRef.current = peerManager;
        setConnected(true);
      } catch (e) {
        // Invalid token, clear it
        localStorage.removeItem('gummybear_token');
        tokenRef.current = null;
      }
    }

    return () => {
      if (messageSyncTimerRef.current) {
        clearInterval(messageSyncTimerRef.current);
      }
      if (peerManagerRef.current) {
        peerManagerRef.current.disconnectAll();
      }
    };
  }, []);

  // Update online users from peer list
  useEffect(() => {
    if (peerManagerRef.current && connected) {
      const updateOnlineUsers = async () => {
        if (!tokenRef.current) return;
        
        try {
          const response = await fetch(`${API_BASE_URL}/signaling/peers`, {
            headers: {
              'Authorization': `Bearer ${tokenRef.current}`
            }
          });

          if (response.ok) {
            const { peers } = await response.json();
            setOnlineUsers(peers.map((p: any) => p.username));
          }
        } catch (error) {
          console.error('Failed to get online users:', error);
        }
      };

      const interval = setInterval(updateOnlineUsers, 10000);
      updateOnlineUsers(); // Initial update

      return () => clearInterval(interval);
    }
  }, [connected]);

  return {
    connected,
    currentUser,
    messages,
    onlineUsers,
    pendingChanges,
    login,
    sendMessage,
    loadPendingChanges,
    approveChange,
    rejectChange,
    executeAIAction
  };
}

