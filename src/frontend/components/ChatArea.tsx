import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, Message, Channel } from '../types';
import { api } from '../../utils/api';

interface ChatAreaProps {
  currentUser: User;
  messages: Message[];
  currentChannel: Channel;
  onSendMessage: (message: string, channel: string) => void;
  onlineUsers: string[];
  allUsers?: User[];
  onKickUser?: (userId: number) => void;
  onChangeRole?: (userId: number, role: string) => void;
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

// Emoji list
const EMOJIS = ['😀', '😂', '❤️', '👍', '👎', '🎉', '🔥', '💯', '✨', '🚀', '💀', '👀', '🤔', '😎', '🥳', '😢', '🤮', '🤯'];

// Parse mentions from message content
const parseMentions = (content: string, users: User[] = []): string => {
  const mentionRegex = /@(\w+)/g;
  let result = content;
  const mentions: string[] = [];
  
  content.replace(mentionRegex, (match, username) => {
    mentions.push(username);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      result = result.replace(
        match,
        `<span class="mention" data-user-id="${user.id}" style="background: ${ROLE_COLORS[user.role] || '#666'}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600; cursor: pointer;">@${user.username}</span>`
      );
    }
    return match;
  });
  
  return result;
};

export function ChatArea({ 
  currentUser, 
  messages, 
  currentChannel, 
  onSendMessage, 
  onlineUsers,
  allUsers = [],
  onKickUser,
  onChangeRole
}: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canType = currentUser.role !== 'bankinda';
  const isAdmin = currentUser.role === 'king' || currentUser.role === 'admin';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Detect @ mentions
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = messageInput.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  }, [messageInput]);

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

  const handleMentionSelect = (username: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = messageInput.substring(0, cursorPos);
    const textAfterCursor = messageInput.substring(cursorPos);
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
    setMessageInput(`${beforeMention}@${username} ${textAfterCursor}`);
    setShowMentionSuggestions(false);
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = beforeMention.length + username.length + 2;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBefore = messageInput.substring(0, cursorPos);
    const textAfter = messageInput.substring(cursorPos);
    setMessageInput(textBefore + emoji + textAfter);
    setShowEmojiPicker(false);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    }, 0);
  };

  const handleKickUser = async (userId: number) => {
    if (!isAdmin || !onKickUser) return;
    if (confirm('Are you sure you want to kick this user?')) {
      try {
        await api.banUser(userId);
        onKickUser(userId);
        setShowUserMenu(null);
      } catch (error) {
        alert('Failed to kick user');
      }
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!isAdmin || !onChangeRole) return;
    try {
      await api.changeUserRole(userId, newRole);
      onChangeRole(userId, newRole);
      setShowUserMenu(null);
    } catch (error) {
      alert('Failed to change role');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) && 
    user.id !== currentUser.id
  ).slice(0, 5);

  const channelMessages = messages.filter(m => m.channel === currentChannel);
  const mentionedMessages = channelMessages.filter(m => {
    const content = m.content.toLowerCase();
    return content.includes(`@${currentUser.username.toLowerCase()}`);
  });

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-black via-gray-900/50 to-black h-screen relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/10 flex justify-between items-center shadow-lg"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {CHANNEL_NAMES[currentChannel]}
          </h2>
          {mentionedMessages.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-semibold shadow-lg"
            >
              {mentionedMessages.length} ping{mentionedMessages.length > 1 ? 's' : ''}
            </motion.span>
          )}
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
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 relative">
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
              const isMentioned = message.content.toLowerCase().includes(`@${currentUser.username.toLowerCase()}`);
              const isEditing = editingMessage === message.id;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredMessage(message.id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                  className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isMentioned ? 'bg-red-500/10 rounded-lg p-2 -mx-2' : ''}`}
                  style={{ maxWidth: '70%', marginLeft: isOwn ? 'auto' : '0' }}
                >
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    onClick={() => setShowUserMenu(showUserMenu === message.sender_id ? null : message.sender_id)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 cursor-pointer relative shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`,
                      boxShadow: `0 4px 15px ${roleColor}40`
                    }}
                  >
                    {message.username.charAt(0).toUpperCase()}
                    {onlineUsers.includes(message.username) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-lg"></div>
                    )}
                  </motion.div>

                  {/* User Menu */}
                  {showUserMenu === message.sender_id && isAdmin && message.sender_id !== currentUser.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-2 shadow-xl"
                      style={{ left: isOwn ? 'auto' : '3rem', right: isOwn ? '3rem' : 'auto' }}
                    >
                      <div className="text-sm font-bold mb-2 text-white">{message.username}</div>
                      <div className="text-xs text-gray-400 mb-3">Role: {ROLE_NAMES[message.role]}</div>
                      <div className="space-y-1">
                        {currentUser.role === 'king' && (
                          <>
                            <select
                              onChange={(e) => e.target.value && handleRoleChange(message.sender_id, e.target.value)}
                              className="w-full px-2 py-1 bg-black/50 border border-white/10 rounded text-xs text-white"
                              defaultValue=""
                            >
                              <option value="">Change Role</option>
                              <option value="admin">Admin</option>
                              <option value="support">Support</option>
                              <option value="twin">Twin</option>
                              <option value="bankinda">Bankinda</option>
                            </select>
                          </>
                        )}
                        <button
                          onClick={() => handleKickUser(message.sender_id)}
                          className="w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                        >
                          Kick User
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Message Bubble */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`relative group/message px-5 py-4 rounded-2xl shadow-lg transition-all ${
                      isOwn 
                        ? 'rounded-tr-sm' 
                        : 'rounded-tl-sm'
                    }`}
                    style={{
                      background: isOwn 
                        ? `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)`
                        : isMentioned
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.15))'
                        : 'rgba(26, 26, 26, 0.9)',
                      border: isOwn ? 'none' : `1px solid ${isMentioned ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm text-white">{message.username}</span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                        style={{
                          background: `${roleColor}25`,
                          color: roleColor,
                          border: `1px solid ${roleColor}40`
                        }}
                      >
                        {ROLE_NAMES[message.role] || message.role}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
                      {isOwn && hoveredMessage === message.id && (
                        <div className="flex gap-1 ml-auto opacity-0 group-hover/message:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingMessage(message.id)}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this message?')) {
                                try {
                                  await api.deleteMessage(message.id);
                                  // Message will be removed on next sync
                                } catch (error) {
                                  alert('Failed to delete message');
                                }
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        defaultValue={message.content}
                        onBlur={async (e) => {
                          const input = e.target as HTMLInputElement;
                          if (input && input.value !== message.content) {
                            try {
                              await api.editMessage(message.id, input.value);
                            } catch (error) {
                              alert('Failed to edit message');
                            }
                          }
                          setEditingMessage(null);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value !== message.content) {
                              try {
                                await api.editMessage(message.id, input.value);
                              } catch (error) {
                                alert('Failed to edit message');
                              }
                            }
                            setEditingMessage(null);
                          }
                          if (e.key === 'Escape') {
                            setEditingMessage(null);
                          }
                        }}
                        className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-sm text-white"
                        autoFocus
                      />
                    ) : (
                      <>
                        <p 
                          className="text-sm text-white/95 break-words leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: parseMentions(message.content, allUsers) }}
                        />
                        {message.metadata?.edited && (
                          <span className="text-xs text-gray-400 italic ml-2 opacity-75">(edited)</span>
                        )}
                      </>
                    )}
                    
                    {/* Emoji Reactions */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {message.metadata?.reactions && Object.entries(message.metadata.reactions).map(([emoji, userIds]: [string, any]) => {
                        const hasReacted = Array.isArray(userIds) && userIds.includes(currentUser.id);
                        return (
                          <button
                            key={emoji}
                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border transition-colors ${
                              hasReacted 
                                ? 'bg-white/20 border-white/30' 
                                : 'bg-black/50 hover:bg-black/70 border-white/10'
                            }`}
                            onClick={async () => {
                              try {
                                await api.addReaction(message.id, emoji);
                                // Reaction will be updated on next sync
                              } catch (error) {
                                console.error('Failed to toggle reaction:', error);
                              }
                            }}
                          >
                            <span>{emoji}</span>
                            <span className="text-gray-400">{Array.isArray(userIds) ? userIds.length : 0}</span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => {
                          const emoji = prompt('Enter emoji:');
                          if (emoji) {
                            api.addReaction(message.id, emoji).catch(err => console.error('Failed to add reaction:', err));
                          }
                        }}
                        className="px-2 py-0.5 text-gray-500 hover:text-gray-300 text-xs opacity-0 group-hover/message:opacity-100 transition-opacity"
                      >
                        + Add reaction
                      </button>
                    </div>
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
          className="p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 relative shadow-2xl"
        >
          {/* Mention Suggestions */}
          {showMentionSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-4 mb-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-2 shadow-xl z-50 min-w-[200px]"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleMentionSelect(user.username)}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 rounded flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                      style={{ background: ROLE_COLORS[user.role] || '#666' }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white">{user.username}</span>
                    <span className="text-xs text-gray-400 ml-auto">{ROLE_NAMES[user.role]}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-400">No users found</div>
              )}
            </motion.div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-4 mb-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl z-50"
            >
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message... Use @ to mention someone"
                maxLength={2000}
                rows={1}
                className="w-full px-5 py-4 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <motion.button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-4 text-xl hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm border border-white/10"
            >
              😊
            </motion.button>
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
