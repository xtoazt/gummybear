import React, { useState, useEffect, useRef } from 'react';
import { Flex, Box, Button, Text, Badge } from '@radix-ui/themes';
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
  const [showKingPanel, setShowKingPanel] = useState(false);

  const isKing = currentUser.role === 'king';

  useEffect(() => {
    if (isKing && currentChannel === 'code') {
      onLoadPendingChanges();
    }
  }, [isKing, currentChannel, onLoadPendingChanges]);

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        currentChannel={currentChannel}
        onChannelChange={setCurrentChannel}
        isKing={isKing}
        pendingCount={pendingChanges.length}
        onlineUsers={onlineUsers.length}
      />
      
      <Flex direction="column" style={{ flex: 1 }}>
        <ChatArea
          currentUser={currentUser}
          messages={messages}
          currentChannel={currentChannel}
          onSendMessage={onSendMessage}
          onlineUsers={onlineUsers}
        />
      </Flex>

      {isKing && currentChannel === 'code' && (
        <KingDashboard
          pendingChanges={pendingChanges}
          onApprove={onApproveChange}
          onReject={onRejectChange}
          onRefresh={onLoadPendingChanges}
        />
      )}
    </Flex>
  );
}
