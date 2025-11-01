import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
      content: 'Welcome to GummyBear! 🍭 This is a demo of the chat interface with beautiful animations.',
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
      content: 'This looks amazing! The dark theme, animations, and TypeScript implementation are perfect. The role-based access control is working great!',
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
  };

  const getRoleConfig = (role: string) => {
    return roleConfig[role] || { color: '#666', name: role, icon: '👤' };
  };

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-6 py-4 flex justify-between items-center z-50"
      >
        <span className="text-lg font-semibold">🍭 GummyBear Demo - This is a preview of the chat interface.</span>
        <Link 
          to="/" 
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
        >
          ← Home
        </Link>
      </motion.div>

      <div className="flex flex-1 mt-16">
        {/* Sidebar */}
        <div className="w-20 bg-black/50 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-4 gap-2">
          {channels.map((channel) => {
            const isActive = currentChannel === channel.id;
            return (
              <motion.button
                key={channel.id}
                onClick={() => setCurrentChannel(channel.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all group"
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)'
                    : 'transparent'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeChannel"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{channel.icon}</span>
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-black/90 border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {channel.name}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="px-6 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {channels.find(c => c.id === currentChannel)?.name || 'Global Chat'}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                style={{ background: '#ff6b6b' }}
              >
                King 👑
              </span>
              <span className="text-gray-400 text-sm">xtoazt</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => {
              const role = getRoleConfig(msg.role);
              return (
                  <motion.div
                  key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    style={{ maxWidth: '70%', marginLeft: msg.isOwn ? 'auto' : '0' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: role.color }}
                    >
                      {msg.username.charAt(0).toUpperCase()}
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`px-4 py-3 rounded-2xl ${
                        msg.isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'
                      }`}
                  style={{
                        background: msg.isOwn 
                          ? `linear-gradient(135deg, ${role.color}, ${role.color}dd)`
                          : 'rgba(26, 26, 26, 0.8)',
                        border: msg.isOwn ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{msg.username}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                            background: `${role.color}20`,
                            color: role.color
                          }}
                        >
                        {role.name}
                        </span>
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-white/90 break-words">{msg.content}</p>
                    </motion.div>
                  </motion.div>
              );
            })}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-black/50 backdrop-blur-sm border-t border-white/10">
            <form onSubmit={handleSend} className="flex gap-3">
              <textarea
                  value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                maxLength={2000}
                  rows={1}
                className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              <motion.button
                  type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff6b6b_0%,#ee5a52_50%,#ff6b6b_100%)]"></span>
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white backdrop-blur-3xl">
                  Send
                </span>
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
