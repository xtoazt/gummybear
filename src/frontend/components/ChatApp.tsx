import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { KingDashboard } from './KingDashboard';
import { UserList } from './UserList';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { User, Message, PendingChange, Channel } from '../types';
import { api } from '../../utils/api';

interface ChatAppProps {
  currentUser: User;
  messages: Message[];
  onlineUsers: string[];
  pendingChanges: PendingChange[];
  onSendMessage: (message: string, channel: string) => void;
  onLoadPendingChanges: () => void;
  onApproveChange: (changeId: number) => void;
  onRejectChange: (changeId: number) => void;
}

export function ChatApp({
  currentUser,
  messages,
  onlineUsers,
  pendingChanges,
  onSendMessage,
  onLoadPendingChanges,
  onApproveChange,
  onRejectChange
}: ChatAppProps) {
  const [currentChannel, setCurrentChannel] = useState<Channel>('global');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const isKing = currentUser.role === 'king';
  const isAdmin = currentUser.role === 'king' || currentUser.role === 'admin';

  useEffect(() => {
    if (isKing && currentChannel === 'code') {
      onLoadPendingChanges();
    }
  }, [isKing, currentChannel, onLoadPendingChanges]);

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      try {
        const { users } = await api.getUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    if (isAdmin) {
      fetchUsers();
      const interval = setInterval(fetchUsers, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleKickUser = async (userId: number) => {
    try {
      await api.banUser(userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to kick user:', error);
    }
  };

  const handleChangeRole = async (userId: number, role: string) => {
    try {
      await api.changeUserRole(userId, role);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as any } : u));
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen overflow-hidden bg-base-100 w-full"
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      <Sidebar
        currentChannel={currentChannel}
        onChannelChange={setCurrentChannel}
        isKing={isKing}
        pendingCount={pendingChanges.length}
        onlineUsers={onlineUsers.length}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatArea
          currentUser={currentUser}
          messages={messages}
          currentChannel={currentChannel}
          onSendMessage={onSendMessage}
          onlineUsers={onlineUsers}
          allUsers={allUsers}
          onKickUser={handleKickUser}
          onChangeRole={handleChangeRole}
        />
      </div>

      {/* User List Sidebar */}
      <UserList
        users={allUsers.length > 0 ? allUsers : [currentUser]}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        onKickUser={handleKickUser}
        onChangeRole={handleChangeRole}
      />

      {isKing && currentChannel === 'code' && (
        <motion.div
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <KingDashboard
            pendingChanges={pendingChanges}
            onApprove={onApproveChange}
            onReject={onRejectChange}
            onRefresh={onLoadPendingChanges}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
