import React, { useEffect, useRef, useState } from 'react';
import { Flex, Box, TextField, Button, Text, Badge, ScrollArea } from '@radix-ui/themes';
import type { User, Message, Channel } from '../types';

interface ChatAreaProps {
  currentUser: User;
  messages: Message[];
  currentChannel: Channel;
  onSendMessage: (message: string, channel: string) => void;
  onlineUsers: string[];
}

const ROLE_COLORS: Record<string, string> = {
  'king': '#ff6b6b',
  'admin': '#4ecdc4',
  'support': '#45b7d1',
  'twin': '#96ceb4',
  'bankinda': '#feca57'
};

const ROLE_NAMES: Record<string, string> = {
  'king': 'King 👑',
  'admin': 'Admin ⚡',
  'support': 'Support 🤖',
  'twin': 'Twin 👥',
  'bankinda': 'Bankinda 👀'
};

const CHANNEL_NAMES: Record<Channel, string> = {
  'global': 'Global Chat',
  'support': 'Support',
  'kajigs': 'Kajigs',
  'finder': 'Finder',
  'dms': 'Direct Messages',
  'settings': 'Settings',
  'code': 'Code Review'
};

export function ChatArea({ currentUser, messages, currentChannel, onSendMessage, onlineUsers }: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canType = currentUser.role !== 'bankinda';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !canType) return;

    const now = Date.now();
    if (now - lastMessageTime < 1500) return;

    onSendMessage(messageInput, currentChannel);
    setMessageInput('');
    setLastMessageTime(now);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const channelMessages = messages.filter(m => m.channel === currentChannel);

  return (
    <Flex direction="column" style={{ flex: 1, background: '#0f0f0f', height: '100vh' }}>
      <Box
        p="4"
        style={{
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text size="5" weight="bold">
          {CHANNEL_NAMES[currentChannel]}
        </Text>
        <Flex gap="3" align="center">
          <Badge
            style={{
              background: ROLE_COLORS[currentUser.role] || '#666',
              color: 'white'
            }}
          >
            {ROLE_NAMES[currentUser.role] || currentUser.role}
          </Badge>
          <Text size="2" color="gray">
            {currentUser.username}
          </Text>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem('gummybear_token');
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </Flex>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
        <Box p="4" style={{ minHeight: '100%' }}>
          <Flex direction="column" gap="2">
            {channelMessages.length === 0 ? (
              <Text size="3" color="gray" align="center" my="6">
                No messages yet. Start the conversation!
              </Text>
            ) : (
              channelMessages.map((message) => {
                const isOwn = message.sender_id === currentUser.id;
                const roleColor = ROLE_COLORS[message.role] || '#666';
                
                return (
                  <Flex
                    key={message.id}
                    direction={isOwn ? 'row-reverse' : 'row'}
                    gap="2"
                    style={{ maxWidth: '70%', marginLeft: isOwn ? 'auto' : '0' }}
                  >
                    <Box
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: roleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        flexShrink: 0
                      }}
                    >
                      {message.username.charAt(0).toUpperCase()}
                    </Box>
                    <Box
                      style={{
                        background: isOwn ? '#ff6b6b' : '#1a1a1a',
                        border: isOwn ? 'none' : '1px solid #333',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        flex: 1
                      }}
                    >
                      <Flex gap="2" align="center" mb="1">
                        <Text size="2" weight="bold">
                          {message.username}
                        </Text>
                        <Badge
                          style={{
                            background: `${roleColor}20`,
                            color: roleColor,
                            fontSize: '0.7rem'
                          }}
                        >
                          {ROLE_NAMES[message.role] || message.role}
                        </Badge>
                        <Text size="1" color="gray">
                          {formatTime(message.created_at)}
                        </Text>
                      </Flex>
                      <Text size="2" style={{ wordBreak: 'break-word' }}>
                        {message.content}
                      </Text>
                    </Box>
                  </Flex>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Flex>
        </Box>
      </ScrollArea>

      {canType && (
        <Box
          p="4"
          style={{
            background: '#1a1a1a',
            borderTop: '1px solid #333'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Flex gap="3">
              <TextField.Root
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1 }}
                size="3"
                maxLength={2000}
              />
              <Button
                type="submit"
                size="3"
                style={{ background: '#ff6b6b' }}
                disabled={!messageInput.trim() || Date.now() - lastMessageTime < 1500}
              >
                Send
              </Button>
            </Flex>
          </form>
        </Box>
      )}
    </Flex>
  );
}
