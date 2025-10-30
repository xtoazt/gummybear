import type { Channel, ChannelInfo } from '../types';

export const CHANNELS: Record<Channel, ChannelInfo> = {
  global: {
    name: 'Global Chat',
    icon: '🌍',
    description: 'Main community chat',
  },
  support: {
    name: 'Support',
    icon: '🆘',
    description: 'Get help and support',
  },
  kajigs: {
    name: 'Kajigs',
    icon: '📝',
    description: 'Custom content and notes',
  },
  finder: {
    name: 'Finder',
    icon: '🔍',
    description: 'Search and discover',
  },
  dms: {
    name: 'Direct Messages',
    icon: '💬',
    description: 'Private conversations',
  },
  settings: {
    name: 'Settings',
    icon: '⚙️',
    description: 'Account and preferences',
  },
};

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // More than 24 hours
  return date.toLocaleDateString();
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatMessageContent(content: string): string {
  // Convert URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkedContent = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
  
  // Convert @mentions to styled spans
  const mentionRegex = /@(\w+)/g;
  const mentionedContent = linkedContent.replace(mentionRegex, '<span class="text-yellow-400 font-medium">@$1</span>');
  
  return mentionedContent;
}

export function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
