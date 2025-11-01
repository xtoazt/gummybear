import { motion, AnimatePresence } from 'framer-motion';
import type { PendingChange } from '../types';

interface KingDashboardProps {
  pendingChanges: PendingChange[];
  onApprove: (changeId: number) => void;
  onReject: (changeId: number) => void;
  onRefresh: () => void;
}

export function KingDashboard({ pendingChanges, onApprove, onReject, onRefresh }: KingDashboardProps) {
  return (
    <div className="w-[500px] bg-black/50 backdrop-blur-sm border-l border-white/10 h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10 flex justify-between items-center"
      >
        <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          💻 Code Review
        </h2>
        <motion.button
          onClick={onRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Refresh
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {pendingChanges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <p className="text-gray-500 italic text-center">
                No pending changes. All clear! 👑
              </p>
            </motion.div>
          ) : (
            pendingChanges.map((change, index) => {
              const actionData = change.action_data || {};
              const params = actionData.params || {};
              
              let detailsContent = '';
              if (change.change_type === 'modify_code') {
                detailsContent = `File: ${params.filePath}\n\n${(params.content || '').substring(0, 500)}...`;
              } else {
                detailsContent = JSON.stringify(actionData, null, 2);
              }

              return (
                <motion.div
                  key={change.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold mb-1 text-white">{change.title}</h3>
                        <p className="text-sm text-gray-400">{change.description || ''}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
                        {change.change_type}
                      </span>
                    </div>

                    <div className="mb-3 p-3 bg-black/50 border border-white/5 rounded-lg max-h-[200px] overflow-auto">
                      <code className="text-xs text-gray-400 whitespace-pre-wrap break-all">
                        {detailsContent}
                      </code>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => {
                          if (confirm('Approve and execute this change?')) {
                            onApprove(change.id);
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-green-500/50 transition-all"
                      >
                        ✓ Approve
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          if (confirm('Reject this change?')) {
                            onReject(change.id);
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
                      >
                        ✗ Reject
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
