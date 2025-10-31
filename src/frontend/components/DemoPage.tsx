import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, TextArea, Button, Badge } from '@radix-ui/themes';

interface Message {
  id: number;
  content: string;
  username: string;
  role: string;
  isOwn: boolean;
  time: string;
}

const roleConfig: Record<string, { color: string; name: string; icon: string }> = {
  'king': { color: '#ff6b6b', name: 'King 👑', icon: '👑' },
  'admin': { color: '#4ecdc4', name: 'Admin ⚡', icon: '⚡' },
  'support': { color: '#45b7d1', name: 'Support 🤖', icon: '🤖' },
  'twin': { color: '#96ceb4', name: 'Twin 👥', icon: '👥' },
  'bankinda': { color: '#feca57', name: 'Bankinda 👀', icon: '👀' }
};

const channels = [
  { id: 'global', name: 'Global Chat', icon: '🌍' },
  { id: 'support', name: 'Support', icon: '🆘' },
  { id: 'kajigs', name: 'Kajigs', icon: '📝' },
  { id: 'finder', name: 'Finder', icon: '🔍' },
  { id: 'dms', name: 'Direct Messages', icon: '💬' },
  { id: 'settings', name: 'Settings', icon: '⚙️' }
];

export function DemoPage() {
  const [currentChannel, setCurrentChannel] = useState('global');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Welcome to GummyBear! 🍭 This is a demo of the chat interface with the new TypeScript frontend.',
      username: 'xtoazt',
      role: 'king',
      isOwn: false,
      time: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      content: 'The AI integration with WebLLM will provide intelligent responses and can create custom components! The role system is now properly implemented - only xtoazt gets the king role.',
      username: 'admin',
      role: 'admin',
      isOwn: false,
      time: new Date().toLocaleTimeString()
    },
    {
      id: 3,
      content: 'This looks amazing! The dark theme, Radix UI components, and TypeScript implementation are perfect. The role-based access control is working great!',
      username: 'you',
      role: 'twin',
      isOwn: true,
      time: new Date().toLocaleTimeString()
    },
    {
      id: 4,
      content: 'The AI system is ready to assist users and create custom components. All backend APIs are properly structured for the TypeScript frontend.',
      username: 'support',
      role: 'support',
      isOwn: false,
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [messageHeight, setMessageHeight] = useState(44);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: messageInput,
      username: 'you',
      role: 'twin',
      isOwn: true,
      time: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    setMessageHeight(44);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const getRoleConfig = (role: string) => {
    return roleConfig[role] || { color: '#666', name: role, icon: '👤' };
  };

  return (
    <Box style={{ height: '100vh', display: 'flex', background: '#0a0a0a', overflow: 'hidden' }}>
      <Box
        style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          fontWeight: 600,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        🍭 GummyBear Demo - This is a preview of the chat interface. Full functionality requires backend.
      </Box>

      <Flex style={{ marginTop: '60px', height: 'calc(100vh - 60px)' }}>
        <Box
          style={{
            width: '80px',
            background: '#1a1a1a',
            borderRight: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1rem 0',
            position: 'relative'
          }}
        >
          {channels.map((channel) => {
            const isActive = currentChannel === channel.id;
            return (
              <Box
                key={channel.id}
                onClick={() => setCurrentChannel(channel.id)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  background: isActive ? '#ff6b6b' : 'transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(255, 107, 107, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isActive ? '#ff6b6b' : '#333';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive ? '#ff6b6b' : 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Text size="6">{channel.icon}</Text>
                <Box
                  style={{
                    position: 'absolute',
                    left: '60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#333',
                    color: 'white',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s ease',
                    zIndex: 1000
                  }}
                  className="tooltip"
                >
                  {channel.name}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Flex direction="column" style={{ flex: 1, background: '#0f0f0f' }}>
          <Box
            style={{
              height: '60px',
              background: '#1a1a1a',
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem'
            }}
          >
            <Text size="5" weight="bold" style={{ color: '#e0e0e0' }}>
              {channels.find(c => c.id === currentChannel)?.name || 'Global Chat'}
            </Text>
            <Flex align="center" gap="3">
              <Badge style={{ background: '#ff6b6b', color: 'white' }}>King 👑</Badge>
              <Text size="3" style={{ color: '#e0e0e0' }}>xtoazt</Text>
            </Flex>
          </Box>

          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            {messages.map((msg) => {
              const role = getRoleConfig(msg.role);
              return (
                <Box
                  key={msg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    maxWidth: '70%',
                    alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
                    background: msg.isOwn ? '#ff6b6b' : '#1a1a1a',
                    border: msg.isOwn ? 'none' : '1px solid #333',
                    color: msg.isOwn ? 'white' : '#e0e0e0',
                    borderBottomRightRadius: msg.isOwn ? '4px' : '12px',
                    borderBottomLeftRadius: msg.isOwn ? '12px' : '4px',
                    animation: 'messageSlide 0.3s ease-out'
                  }}
                >
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      flexShrink: 0,
                      background: role.color
                    }}
                  >
                    {msg.username.charAt(0).toUpperCase()}
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex align="center" gap="2" wrap="wrap" mb="1">
                      <Text size="2" weight="bold">{msg.username}</Text>
                      <Badge style={{ background: `${role.color}20`, color: role.color, fontSize: '0.7rem' }}>
                        {role.name}
                      </Badge>
                      <Text size="1" style={{ color: '#666', marginLeft: 'auto' }}>
                        {msg.time}
                      </Text>
                    </Flex>
                    <Text size="2" style={{ lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {msg.content}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box
            style={{
              padding: '1rem',
              background: '#1a1a1a',
              borderTop: '1px solid #333'
            }}
          >
            <form onSubmit={handleSend}>
              <Flex gap="3" align="flex-end">
                <TextArea
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    background: '#0f0f0f',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    color: '#e0e0e0',
                    fontSize: '1rem',
                    resize: 'none',
                    minHeight: '44px',
                    maxHeight: '120px',
                    fontFamily: 'inherit'
                  }}
                  rows={1}
                  maxLength={2000}
                />
                <Button
                  type="submit"
                  style={{
                    background: '#ff6b6b',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </Button>
              </Flex>
            </form>
          </Box>
        </Flex>
      </Flex>

      <style>{`
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .tooltip {
          opacity: 0 !important;
        }
        .tooltip:hover {
          opacity: 1 !important;
        }
      `}</style>
    </Box>
  );
}

