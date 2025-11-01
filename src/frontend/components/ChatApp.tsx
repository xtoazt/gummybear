import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { KingDashboard } from './KingDashboard';
import type { User, Message, PendingChange, Channel } from '../types';

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

  const isKing = currentUser.role === 'king';

  useEffect(() => {
    if (isKing && currentChannel === 'code') {
      onLoadPendingChanges();
    }
  }, [isKing, currentChannel, onLoadPendingChanges]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen overflow-hidden bg-black"
    >
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
        />
      </div>

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
