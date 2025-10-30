import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User, Message, PendingChange } from '../types';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  currentUser: User | null;
  messages: Message[];
  onlineUsers: string[];
  pendingChanges: PendingChange[];
  login: (username: string, password: string) => void;
  sendMessage: (message: string, channel: string) => void;
  loadPendingChanges: () => void;
  approveChange: (changeId: number) => void;
  rejectChange: (changeId: number) => void;
  executeAIAction: (action: string, params: any) => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('gummybear_token');
    tokenRef.current = savedToken;

    const newSocket = io({
      path: '/chat/socket.io/',
      auth: savedToken ? { token: savedToken } : undefined
    });

    newSocket.on('connect', () => {
      console.log('Connected to GummyBear server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('username-accepted', (username: string) => {
      if (tokenRef.current) {
        try {
          const payload = JSON.parse(atob(tokenRef.current.split('.')[1]));
          setCurrentUser({
            id: payload.userId,
            username: payload.username,
            role: 'king',
            status: 'approved',
            created_at: '',
            last_seen: ''
          });
        } catch (e) {
          // Handle error
        }
      }
    });

    newSocket.on('user-data', (userData: User) => {
      setCurrentUser(userData);
    });

    newSocket.on('chat-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('online-users', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('pending-changes', (changes: PendingChange[]) => {
      setPendingChanges(changes);
    });

    newSocket.on('pending-change-created', () => {
      newSocket.emit('get-pending-changes');
    });

    newSocket.on('pending-changes-updated', () => {
      newSocket.emit('get-pending-changes');
    });

    newSocket.on('token', (token: string) => {
      localStorage.setItem('gummybear_token', token);
      tokenRef.current = token;
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const login = useCallback((username: string, password: string) => {
    if (socket) {
      socket.emit('set-username', { username, password });
    }
  }, [socket]);

  const sendMessage = useCallback((message: string, channel: string) => {
    if (socket && message.trim()) {
      socket.emit('chat-message', message);
    }
  }, [socket]);

  const loadPendingChanges = useCallback(() => {
    if (socket && currentUser?.role === 'king') {
      socket.emit('get-pending-changes');
    }
  }, [socket, currentUser]);

  const approveChange = useCallback((changeId: number) => {
    if (socket && currentUser?.role === 'king') {
      socket.emit('approve-change', { changeId });
    }
  }, [socket, currentUser]);

  const rejectChange = useCallback((changeId: number) => {
    if (socket && currentUser?.role === 'king') {
      socket.emit('reject-change', { changeId });
    }
  }, [socket, currentUser]);

  const executeAIAction = useCallback((action: string, params: any) => {
    if (socket) {
      socket.emit('ai-action', { action, params });
    }
  }, [socket]);

  return {
    socket,
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