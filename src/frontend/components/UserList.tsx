import { motion } from 'framer-motion';
import type { User } from '../types';

interface UserListProps {
  users: User[];
  onlineUsers: string[];
  currentUser: User;
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

export function UserList({ users, onlineUsers, currentUser, onKickUser, onChangeRole }: UserListProps) {
  const isAdmin = currentUser.role === 'king' || currentUser.role === 'admin';
  const isKing = currentUser.role === 'king';

  // Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  const roleOrder = ['king', 'admin', 'support', 'twin', 'bankinda'];

  return (
    <div className="w-60 bg-black/60 backdrop-blur-xl border-l border-white/10 h-screen overflow-y-auto shadow-lg">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">
          Members — {users.length}
        </h3>
        <div className="text-xs text-pink-400 font-semibold">
          {onlineUsers.length} online
        </div>
      </div>

      <div className="p-2 space-y-4">
        {roleOrder.map(role => {
          const roleUsers = groupedUsers[role] || [];
          if (roleUsers.length === 0) return null;

          return (
            <div key={role}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide px-2 mb-2">
                {ROLE_NAMES[role]} — {roleUsers.length}
              </div>
              <div className="space-y-1">
                {roleUsers.map(user => {
                  const isOnline = onlineUsers.includes(user.username);
                  const canManage = isAdmin && user.id !== currentUser.id;
                  
                  return (
                    <motion.div
                      key={user.id}
                      whileHover={{ x: 4, scale: 1.02 }}
                      className="group relative px-3 py-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold"
                            style={{ background: ROLE_COLORS[user.role] || '#666' }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {user.username}
                            {user.id === currentUser.id && (
                              <span className="text-xs text-gray-500 ml-1">(you)</span>
                            )}
                          </div>
                          {user.status !== 'approved' && (
                            <div className="text-xs text-red-400">
                              {user.status}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {canManage && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-1 shadow-xl min-w-[120px]">
                            {isKing && (
                              <select
                                onChange={(e) => e.target.value && onChangeRole?.(user.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 bg-black/50 border border-white/10 rounded text-xs text-white mb-1"
                                defaultValue={user.role}
                              >
                                <option value="king">King</option>
                                <option value="admin">Admin</option>
                                <option value="support">Support</option>
                                <option value="twin">Twin</option>
                                <option value="bankinda">Bankinda</option>
                              </select>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Kick ${user.username}?`)) {
                                  onKickUser?.(user.id);
                                }
                              }}
                              className="w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors"
                            >
                              Kick
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

