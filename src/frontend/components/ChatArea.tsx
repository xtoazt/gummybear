import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex flex-col flex-1 bg-black h-screen relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-mono text-sm">$</span>
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {CHANNEL_NAMES[currentChannel]}
          </h2>
          <span className="text-green-400/50 font-mono text-xs">// {currentChannel}</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{ background: ROLE_COLORS[currentUser.role] || '#666' }}
          >
            {ROLE_NAMES[currentUser.role] || currentUser.role}
          </div>
          <span className="text-gray-400 text-sm">{currentUser.username}</span>
          <button
            onClick={() => {
              localStorage.removeItem('gummybear_token');
              window.location.reload();
            }}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {channelMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
            </motion.div>
          ) : (
            channelMessages.map((message, index) => {
              const isOwn = message.sender_id === currentUser.id;
              const roleColor = ROLE_COLORS[message.role] || '#666';
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  style={{ maxWidth: '70%', marginLeft: isOwn ? 'auto' : '0' }}
                >
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: roleColor }}
                  >
                    {message.username.charAt(0).toUpperCase()}
                  </motion.div>

                  {/* Message Bubble */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative group px-4 py-3 rounded-2xl ${
                      isOwn 
                        ? 'rounded-tr-sm' 
                        : 'rounded-tl-sm'
                    }`}
                    style={{
                      background: isOwn 
                        ? `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`
                        : 'rgba(26, 26, 26, 0.8)',
                      border: isOwn ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{message.username}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: `${roleColor}20`,
                          color: roleColor
                        }}
                      >
                        {ROLE_NAMES[message.role] || message.role}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                    </div>
                    <p className="text-sm text-white/90 break-words">{message.content}</p>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {canType && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-black/50 backdrop-blur-sm border-t border-white/10"
        >
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              maxLength={2000}
              className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
            <motion.button
              type="submit"
              disabled={!messageInput.trim() || Date.now() - lastMessageTime < 1500}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff6b6b_0%,#ee5a52_50%,#ff6b6b_100%)]"></span>
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white backdrop-blur-3xl">
                Send
              </span>
            </motion.button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
