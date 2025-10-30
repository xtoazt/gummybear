import React from 'react';
import { Flex, Box, Badge, Text } from '@radix-ui/themes';
import type { Channel } from '../types';

interface SidebarProps {
  currentChannel: Channel;
  onChannelChange: (channel: Channel) => void;
  isKing: boolean;
  pendingCount: number;
  onlineUsers: number;
}

const CHANNELS = [
  { id: 'global' as Channel, icon: '🌍', label: 'Global Chat' },
  { id: 'support' as Channel, icon: '🆘', label: 'Support' },
  { id: 'kajigs' as Channel, icon: '📝', label: 'Kajigs' },
  { id: 'finder' as Channel, icon: '🔍', label: 'Finder' },
  { id: 'dms' as Channel, icon: '💬', label: 'Direct Messages' },
  { id: 'settings' as Channel, icon: '⚙️', label: 'Settings' }
];

export function Sidebar({ currentChannel, onChannelChange, isKing, pendingCount, onlineUsers }: SidebarProps) {
  return (
    <Flex
      direction="column"
      style={{
        width: '80px',
        background: '#1a1a1a',
        borderRight: '1px solid #333',
        alignItems: 'center',
        padding: '1rem 0',
        gap: '1rem',
        position: 'relative'
      }}
    >
      {CHANNELS.map((channel) => (
        <Box
          key={channel.id}
          onClick={() => onChannelChange(channel.id)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: currentChannel === channel.id ? '#ff6b6b' : 'transparent',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (currentChannel !== channel.id) {
              e.currentTarget.style.background = '#333';
            }
          }}
          onMouseLeave={(e) => {
            if (currentChannel !== channel.id) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Text size="6">{channel.icon}</Text>
        </Box>
      ))}

      {isKing && (
        <Box
          onClick={() => onChannelChange('code')}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: currentChannel === 'code' ? '#ff6b6b' : 'transparent',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (currentChannel !== 'code') {
              e.currentTarget.style.background = '#333';
            }
          }}
          onMouseLeave={(e) => {
            if (currentChannel !== 'code') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Text size="6">💻</Text>
          {pendingCount > 0 && (
            <Badge
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff6b6b',
                color: 'white',
                minWidth: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                border: '2px solid #1a1a1a'
              }}
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          )}
        </Box>
      )}

      <Box style={{ position: 'absolute', bottom: '1rem', fontSize: '0.8rem', color: '#666' }}>
        {onlineUsers} online
      </Box>
    </Flex>
  );
}