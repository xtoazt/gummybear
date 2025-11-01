import { motion } from 'framer-motion';
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
    <div className="w-20 bg-base-200/80 backdrop-blur-lg border-r border-base-300 flex flex-col items-center py-4 gap-2 relative shadow-lg">
      {CHANNELS.map((channel) => (
        <motion.button
          key={channel.id}
          onClick={() => onChannelChange(channel.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all group"
          style={{
            background: currentChannel === channel.id 
              ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)'
              : 'transparent'
          }}
        >
          {currentChannel === channel.id && (
            <motion.div
              layoutId="activeChannel"
              className="absolute inset-0 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{channel.icon}</span>
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-3 py-1.5 bg-base-200 border border-base-300 rounded-lg text-xs font-medium text-base-content opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {channel.label}
          </div>
        </motion.button>
      ))}

      {isKing && (
        <motion.button
          onClick={() => onChannelChange('code')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all group mt-2"
          style={{
            background: currentChannel === 'code' 
              ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)'
              : 'transparent'
          }}
        >
          {currentChannel === 'code' && (
            <motion.div
              layoutId="activeCodeChannel"
              className="absolute inset-0 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">💻</span>
          
          {pendingCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-error rounded-full flex items-center justify-center text-xs font-bold text-error-content border-2 border-base-100"
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </motion.div>
          )}
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-3 py-1.5 bg-base-200 border border-base-300 rounded-lg text-xs font-medium text-base-content opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Code Review
          </div>
        </motion.button>
      )}

      <div className="absolute bottom-4 text-xs text-base-content/60 font-medium">
        {onlineUsers} online
      </div>
    </div>
  );
}
