import React from 'react';
import { Flex, Box, Text, Button, ScrollArea, Badge, Code } from '@radix-ui/themes';
import type { PendingChange } from '../types';

interface KingDashboardProps {
  pendingChanges: PendingChange[];
  onApprove: (changeId: number) => void;
  onReject: (changeId: number) => void;
  onRefresh: () => void;
}

export function KingDashboard({ pendingChanges, onApprove, onReject, onRefresh }: KingDashboardProps) {
  return (
    <Box
      style={{
        width: '500px',
        background: '#1a1a1a',
        borderLeft: '1px solid #333',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        p="4"
        style={{
          background: '#0f0f0f',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text size="5" weight="bold" style={{ color: '#ff6b6b' }}>
          💻 Code Review
        </Text>
        <Button variant="ghost" size="2" onClick={onRefresh}>
          Refresh
        </Button>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
        <Box p="4">
          {pendingChanges.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Text size="3" color="gray" style={{ fontStyle: 'italic' }}>
                No pending changes. All clear! 👑
              </Text>
            </Box>
          ) : (
            <Flex direction="column" gap="3">
              {pendingChanges.map((change) => {
                const actionData = change.action_data || {};
                const params = actionData.params || {};
                
                let detailsContent = '';
                if (change.change_type === 'modify_code') {
                  detailsContent = `File: ${params.filePath}\n\n${(params.content || '').substring(0, 500)}...`;
                } else {
                  detailsContent = JSON.stringify(actionData, null, 2);
                }

                return (
                  <Box
                    key={change.id}
                    p="4"
                    style={{
                      background: '#0f0f0f',
                      border: '1px solid #333',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Flex justify="between" align="start" mb="3">
                      <Box>
                        <Text size="4" weight="bold" mb="1" style={{ display: 'block' }}>
                          {change.title}
                        </Text>
                        <Text size="2" color="gray">
                          {change.description || ''}
                        </Text>
                      </Box>
                      <Badge style={{ background: '#ff6b6b', color: 'white' }}>
                        {change.change_type}
                      </Badge>
                    </Flex>

                    <Box
                      p="3"
                      mb="3"
                      style={{
                        background: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}
                    >
                      <Code style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {detailsContent}
                      </Code>
                    </Box>

                    <Flex gap="2">
                      <Button
                        style={{ flex: 1, background: '#4caf50' }}
                        onClick={() => {
                          if (confirm('Approve and execute this change?')) {
                            onApprove(change.id);
                          }
                        }}
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        variant="soft"
                        color="red"
                        style={{ flex: 1 }}
                        onClick={() => {
                          if (confirm('Reject this change?')) {
                            onReject(change.id);
                          }
                        }}
                      >
                        ✗ Reject
                      </Button>
                    </Flex>
                  </Box>
                );
              })}
            </Flex>
          )}
        </Box>
      </ScrollArea>
    </Box>
  );
}
